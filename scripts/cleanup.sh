#!/bin/bash
# ============================================
# Pazaryonetimi Server Cleanup Script
# Belirli aralıklarla çalıştırılarak sunucu temizliği yapar
# ============================================

set -e

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log fonksiyonları
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Boyut formatlama
format_size() {
    local size=$1
    if [ $size -ge 1073741824 ]; then
        echo "$(echo "scale=2; $size/1073741824" | bc) GB"
    elif [ $size -ge 1048576 ]; then
        echo "$(echo "scale=2; $size/1048576" | bc) MB"
    elif [ $size -ge 1024 ]; then
        echo "$(echo "scale=2; $size/1024" | bc) KB"
    else
        echo "$size B"
    fi
}

# Başlangıç disk kullanımını kaydet
get_disk_usage() {
    df -h / | awk 'NR==2 {print $5}' | sed 's/%//'
}

START_USAGE=$(get_disk_usage)
log_info "Başlangıç disk kullanımı: %$START_USAGE"

FREED_SPACE=0

# ============================================
# 1. DOCKER TEMİZLİK
# ============================================

cleanup_docker() {
    log_info "Docker temizliği başlatılıyor..."

    # Kullanılmayan container'ları sil
    local containers=$(docker ps -aq --filter "status=exited" 2>/dev/null || true)
    if [ -n "$containers" ]; then
        local count=$(echo "$containers" | wc -l)
        docker rm $containers >/dev/null 2>&1 || true
        log_success "$count adet durmuş container silindi"
    else
        log_info "Silinecek durmuş container bulunamadı"
    fi

    # Kullanılmayan image'ları sil (son 7 gün kullanılmayanlar)
    local images=$(docker images -q --filter "dangling=true" 2>/dev/null || true)
    if [ -n "$images" ]; then
        local count=$(echo "$images" | wc -l)
        docker rmi $images >/dev/null 2>&1 || true
        log_success "$count adet dangling image silindi"
    fi

    # Kullanılmayan volume'ları sil
    local volumes=$(docker volume ls -q --filter "dangling=true" 2>/dev/null || true)
    if [ -n "$volumes" ]; then
        local count=$(echo "$volumes" | wc -l)
        docker volume rm $volumes >/dev/null 2>&1 || true
        log_success "$count adet kullanılmayan volume silindi"
    fi

    # Docker build cache temizliği
    docker builder prune -f --filter "until=168h" >/dev/null 2>&1 || true
    log_success "Eski Docker build cache temizlendi (>7 gün)"

    log_success "Docker temizliği tamamlandı"
}

# ============================================
# 2. Npm/Node Modules Cache Temizliği
# ============================================

cleanup_npm() {
    log_info "NPM cache temizliği başlatılıyor..."

    # NPM cache temizliği
    if command -v npm &> /dev/null; then
        npm cache clean --force >/dev/null 2>&1 || true
        log_success "NPM cache temizlendi"
    fi

    # Yarn cache temizliği (eğer varsa)
    if command -v yarn &> /dev/null; then
        yarn cache clean --all >/dev/null 2>&1 || true
        log_success "Yarn cache temizlendi"
    fi

    # PNPM cache temizliği (eğer varsa)
    if command -v pnpm &> /dev/null; then
        pnpm store prune >/dev/null 2>&1 || true
        log_success "PNPM store temizlendi"
    fi

    log_success "NPM cache temizliği tamamlandı"
}

# ============================================
# 3. Sistem Log ve Temp Temizliği
# ============================================

cleanup_system() {
    log_info "Sistem temizliği başlatılıyor..."

    # Log dosyalarını rotate et ve eskileri sil
    if [ -d "/var/log" ]; then
        find /var/log -name "*.log.*" -type f -mtime +7 -delete 2>/dev/null || true
        find /var/log -name "*.gz" -type f -mtime +30 -delete 2>/dev/null || true
        log_success "Eski log dosyaları temizlendi (>7 gün)"
    fi

    # Tmp temizliği
    find /tmp -type f -atime +3 -delete 2>/dev/null || true
    find /var/tmp -type f -atime +3 -delete 2>/dev/null || true
    log_success "Tmp dizini temizlendi (>3 gün)"

    # Eski kernel paketlerini temizle (Debian/Ubuntu)
    if command -v apt-get &> /dev/null; then
        apt-get autoremove -y >/dev/null 2>&1 || true
        apt-get autoclean >/dev/null 2>&1 || true
        log_success "APT cache ve gereksiz paketler temizlendi"
    fi

    # Journalctl temizliği (son 7 günü tut)
    if command -v journalctl &> /dev/null; then
        journalctl --vacuum-time=7d >/dev/null 2>&1 || true
        log_success "Systemd journal temizlendi (>7 gün)"
    fi

    log_success "Sistem temizliği tamamlandı"
}

# ============================================
# 4. Proje Özel Temizliği (Next.js build cache)
# ============================================

cleanup_project() {
    log_info "Proje özel temizliği başlatılıyor..."

    local project_dir="/app"
    if [ -d "$project_dir" ]; then
        # Next.js cache temizliği (eğer container dışında çalışıyorsa)
        find "$project_dir" -path "*/.next/cache" -type d -exec rm -rf {} + 2>/dev/null || true

        # Eski build dosyaları
        find "$project_dir" -name "*.log" -type f -mtime +3 -delete 2>/dev/null || true

        # Coverage ve test sonuçları
        find "$project_dir" -name "coverage" -type d -exec rm -rf {} + 2>/dev/null || true

        log_success "Proje cache ve log dosyaları temizlendi"
    fi

    log_success "Proje temizliği tamamlandı"
}

# ============================================
# 5. Redis Cache Temizliği (opsiyonel)
# ============================================

cleanup_redis() {
    log_info "Redis temizliği kontrol ediliyor..."

    # Redis'e ping atabilirsek, eski key'leri temizle
    if command -v redis-cli &> /dev/null; then
        # Sadece expired key'lerin otomatik temizlenmesi için (passive)
        redis-cli BGREWRITEAOF >/dev/null 2>&1 || true
        log_success "Redis AOF rewrite tetiklendi"
    fi
}

# ============================================
# ANA FONKSİYON
# ============================================

main() {
    log_info "=========================================="
    log_info "PAZARYONETIMI TEMİZLİK BAŞLATILIYOR"
    log_info "=========================================="

    # Temizlik modülü seçimi
    local mode="${1:-full}"

    case "$mode" in
        docker)
            cleanup_docker
            ;;
        npm)
            cleanup_npm
            ;;
        system)
            cleanup_system
            ;;
        project)
            cleanup_project
            ;;
        redis)
            cleanup_redis
            ;;
        full|*)
            cleanup_docker
            cleanup_npm
            cleanup_system
            cleanup_project
            cleanup_redis
            ;;
    esac

    # Sonuç raporu
    END_USAGE=$(get_disk_usage)
    SAVED=$((START_USAGE - END_USAGE))

    log_info "=========================================="
    log_info "TEMİZLİK RAPORU"
    log_info "=========================================="
    log_info "Başlangıç disk kullanımı: %$START_USAGE"
    log_info "Bitiş disk kullanımı: %$END_USAGE"

    if [ $SAVED -gt 0 ]; then
        log_success "Toplam tasarruf: %$SAVED"
    else
        log_warning "Disk kullanımı değişmedi veya arttı"
    fi

    log_info "=========================================="
    log_success "TEMİZLİK TAMAMLANDI - $(date '+%Y-%m-%d %H:%M:%S')"
    log_info "=========================================="
}

# Scripti çalıştır
main "$@"
