/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AISmartIntentService } from './ai-smart-intent.service';

export interface VoiceCommand {
  audioData: string; // Base64 encoded audio
  language?: string;
  userId: string;
  tenantId: string;
  conversationId?: string;
}

export interface VoiceCommandResult {
  success: boolean;
  transcript?: string;
  command?: string;
  confidence?: number;
  response?: {
    text: string;
    audioUrl?: string; // URL to TTS audio
  };
  error?: string;
}

@Injectable()
export class AIVoiceService {
  private readonly logger = new Logger(AIVoiceService.name);
  private openai: OpenAI | null = null;

  constructor(
    private configService: ConfigService,
    private smartIntent: AISmartIntentService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  // ==================== SPEECH TO TEXT ====================

  async processVoiceCommand(
    command: VoiceCommand,
  ): Promise<VoiceCommandResult> {
    try {
      this.logger.debug(`Processing voice command for user ${command.userId}`);

      // Step 1: Speech-to-Text
      const transcript = await this.speechToText(
        command.audioData,
        command.language,
      );

      if (!transcript) {
        return {
          success: false,
          error: 'Could not understand audio',
        };
      }

      // Step 2: Detect intent from transcript
      const intent = await this.smartIntent.detectIntent(
        transcript,
        command.tenantId,
        command.userId,
      );

      // Step 3: Generate response
      const response = await this.generateVoiceResponse(
        intent,
        command.language || 'tr',
      );

      return {
        success: true,
        transcript,
        command: intent.type,
        confidence: intent.confidence,
        response,
      };
    } catch (error) {
      this.logger.error('Voice command processing failed:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Voice processing failed',
      };
    }
  }

  private async speechToText(
    audioData: string,
    language?: string,
  ): Promise<string | null> {
    try {
      // Decode base64 to buffer
      const audioBuffer = Buffer.from(audioData, 'base64');

      // Create a File object from buffer
      const file = new File([audioBuffer], 'audio.webm', {
        type: 'audio/webm',
      });

      if (!this.openai) {
        this.logger.warn('OpenAI not configured, using fallback transcription');
        return null;
      }

      const response = await this.openai.audio.transcriptions.create({
        file: file as any,
        model: 'whisper-1',
        language: language || 'tr',
        response_format: 'text',
      });

      return typeof response === 'string' ? response : null;
    } catch (error) {
      this.logger.error('Speech-to-text failed:', error);
      return null;
    }
  }

  // ==================== TEXT TO SPEECH ====================

  async textToSpeech(text: string, language = 'tr'): Promise<string> {
    try {
      if (!this.openai) {
        this.logger.warn('OpenAI not configured for TTS');
        return '';
      }

      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: language === 'tr' ? 'nova' : 'alloy',
        input: text,
      });

      // Convert to base64
      const buffer = Buffer.from(await mp3.arrayBuffer());
      return `data:audio/mp3;base64,${buffer.toString('base64')}`;
    } catch (error) {
      this.logger.error('Text-to-speech failed:', error);
      return '';
    }
  }

  // ==================== VOICE RESPONSE GENERATION ====================

  private async generateVoiceResponse(
    intent: any,
    language: string,
  ): Promise<{ text: string; audioUrl?: string }> {
    const responses: Record<string, Record<string, string>> = {
      tr: {
        BRAND_SYNC: 'Marka eşitleme işlemi başlatılıyor. Lütfen bekleyin.',
        CATEGORY_SYNC: 'Kategori eşitleme işlemi başlatılıyor.',
        PRODUCT_UPLOAD: 'Ürün yükleme işlemi başlatılıyor.',
        VARIANT_MANAGE: 'Varyant yönetimi açılıyor.',
        GENERAL: 'Anladım. Size nasıl yardımcı olabilirim?',
        ERROR: 'Üzgünüm, komutu anlayamadım. Lütfen tekrar söyleyin.',
      },
      en: {
        BRAND_SYNC: 'Starting brand synchronization. Please wait.',
        CATEGORY_SYNC: 'Starting category synchronization.',
        PRODUCT_UPLOAD: 'Starting product upload.',
        VARIANT_MANAGE: 'Opening variant management.',
        GENERAL: 'I understand. How can I help you?',
        ERROR: 'Sorry, I did not understand. Please repeat.',
      },
    };

    const langResponses = responses[language] || responses.en;
    const responseText =
      intent.confidence > 0.6
        ? langResponses[intent.type] || langResponses.GENERAL
        : langResponses.ERROR;

    // Generate TTS audio
    const audioUrl = await this.textToSpeech(responseText, language);

    return {
      text: responseText,
      audioUrl: audioUrl || undefined,
    };
  }

  // ==================== VOICE COMMAND PATTERNS ====================

  getCommonVoiceCommands(language = 'tr'): Array<{
    command: string;
    description: string;
    example: string;
  }> {
    const commands: Record<
      string,
      Array<{ command: string; description: string; example: string }>
    > = {
      tr: [
        {
          command: 'marka eşitle',
          description: 'Pazaryerinden markaları eşitle',
          example: 'Trendyoldan markaları eşitle',
        },
        {
          command: 'kategori eşitle',
          description: 'Kategorileri senkronize et',
          example: 'Kategorileri güncelle',
        },
        {
          command: 'ürün yükle',
          description: 'Ürün yükleme işlemi',
          example: 'Ürünü Trendyola yükle',
        },
        {
          command: 'stok güncelle',
          description: 'Stok senkronizasyonu',
          example: 'Stokları senkronize et',
        },
        {
          command: 'fiyat güncelle',
          description: 'Fiyat senkronizasyonu',
          example: 'Fiyatları güncelle',
        },
        {
          command: 'rapor göster',
          description: 'Rapor görüntüleme',
          example: 'Günlük raporu göster',
        },
        {
          command: 'yardım',
          description: 'Yardım menüsü',
          example: 'Yardım et',
        },
      ],
      en: [
        {
          command: 'sync brands',
          description: 'Sync brands from marketplace',
          example: 'Sync brands from Amazon',
        },
        {
          command: 'sync categories',
          description: 'Sync categories',
          example: 'Update categories',
        },
        {
          command: 'upload product',
          description: 'Upload product',
          example: 'Upload product to Amazon',
        },
        {
          command: 'update stock',
          description: 'Sync stock levels',
          example: 'Sync stock levels',
        },
        {
          command: 'update prices',
          description: 'Sync prices',
          example: 'Update prices',
        },
        {
          command: 'show report',
          description: 'View reports',
          example: 'Show daily report',
        },
        { command: 'help', description: 'Help menu', example: 'Help me' },
      ],
    };

    return commands[language] || commands.en;
  }

  // ==================== AUDIO PROCESSING UTILITIES ====================

  /**
   * Validate audio format
   */
  validateAudio(audioData: string): {
    valid: boolean;
    format?: string;
    error?: string;
  } {
    try {
      // Check if valid base64
      const buffer = Buffer.from(audioData, 'base64');

      if (buffer.length < 100) {
        return { valid: false, error: 'Audio data too small' };
      }

      // Check audio format (simplified)
      // Real implementation would check magic bytes
      const isWav = buffer.slice(0, 4).toString('hex') === '52494646';
      const isMp3 = buffer.slice(0, 2).toString('hex') === 'ffe3';
      const isOgg = buffer.slice(0, 4).toString() === 'OggS';

      if (!isWav && !isMp3 && !isOgg) {
        return {
          valid: false,
          error: 'Unsupported audio format. Use WAV, MP3, or OGG.',
        };
      }

      return {
        valid: true,
        format: isWav ? 'wav' : isMp3 ? 'mp3' : 'ogg',
      };
    } catch {
      return { valid: false, error: 'Invalid audio data' };
    }
  }

  /**
   * Convert audio format
   */
  async convertAudio(
    audioData: string,
    targetFormat: 'wav' | 'mp3' | 'ogg',
  ): Promise<string> {
    // This would use an audio conversion library
    // For now, return the original
    this.logger.log(`Converting audio to ${targetFormat}`);
    return audioData;
  }

  /**
   * Check microphone permissions (client-side info)
   */
  checkMicrophoneSupport(): { supported: boolean; error?: string } {
    // This is just informative - actual check is client-side
    return { supported: true };
  }

  // ==================== REAL-TIME VOICE CHAT ====================

  async startVoiceSession(
    userId: string,
    tenantId: string,
  ): Promise<{ sessionId: string; wsUrl: string }> {
    // Create a voice session for real-time streaming
    const sessionId = `voice_${Date.now()}_${userId}`;

    this.logger.log(`Voice session started: ${sessionId}`);

    return {
      sessionId,
      wsUrl: `/ai-assistant/voice/stream?session=${sessionId}`,
    };
  }

  async endVoiceSession(sessionId: string): Promise<void> {
    this.logger.log(`Voice session ended: ${sessionId}`);
  }

  /**
   * Process streaming audio chunk
   */
  async processAudioChunk(
    sessionId: string,
    audioChunk: string,
  ): Promise<{ transcript?: string; isFinal: boolean }> {
    // This would process streaming audio chunks
    // and return interim/final transcripts

    return {
      transcript: undefined,
      isFinal: false,
    };
  }
}
