// Form Builder - Dynamic Form Generation
// Drag-and-drop form builder with validation

type FieldType = 
  | 'text' | 'email' | 'number' | 'tel' | 'url'
  | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio'
  | 'date' | 'datetime' | 'time' | 'file' | 'image'
  | 'password' | 'color' | 'range' | 'rating' | 'signature';

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  defaultValue?: unknown;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: string; // JavaScript function as string
  };
  options?: Array<{ label: string; value: string }>;
  conditions?: Array<{
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value: unknown;
    action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
  }>;
  layout?: {
    width: 'full' | 'half' | 'third' | 'quarter';
    row: number;
  };
  style?: {
    labelPosition?: 'top' | 'left' | 'right';
    size?: 'small' | 'medium' | 'large';
  };
}

interface Form {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  fields: FormField[];
  settings: {
    submitButtonText: string;
    successMessage: string;
    redirectUrl?: string;
    emailNotifications?: string[];
    saveToDatabase: boolean;
    webhooks?: string[];
  };
  styling?: {
    theme: 'default' | 'minimal' | 'card' | 'stepper';
    primaryColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  metadata: {
    ipAddress: string;
    userAgent: string;
    submittedAt: Date;
    userId?: string;
  };
  status: 'pending' | 'processed' | 'rejected';
}

// Form builder
export class FormBuilder {
  private forms: Map<string, Form> = new Map();

  // Create new form
  createForm(
    tenantId: string,
    config: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>
  ): Form {
    const form: Form = {
      ...config,
      id: crypto.randomUUID(),
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.forms.set(form.id, form);
    return form;
  }

  // Add field to form
  addField(formId: string, field: Omit<FormField, 'id'>): FormField {
    const form = this.forms.get(formId);
    if (!form) throw new Error('Form not found');

    const newField: FormField = {
      ...field,
      id: crypto.randomUUID(),
    };

    form.fields.push(newField);
    form.updatedAt = new Date();

    return newField;
  }

  // Reorder fields
  reorderFields(formId: string, fieldIds: string[]): void {
    const form = this.forms.get(formId);
    if (!form) throw new Error('Form not found');

    const fieldMap = new Map(form.fields.map(f => [f.id, f]));
    form.fields = fieldIds.map(id => fieldMap.get(id)).filter(Boolean) as FormField[];
    form.updatedAt = new Date();
  }

  // Update field
  updateField(formId: string, fieldId: string, updates: Partial<FormField>): FormField {
    const form = this.forms.get(formId);
    if (!form) throw new Error('Form not found');

    const fieldIndex = form.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) throw new Error('Field not found');

    form.fields[fieldIndex] = { ...form.fields[fieldIndex], ...updates };
    form.updatedAt = new Date();

    return form.fields[fieldIndex];
  }

  // Remove field
  removeField(formId: string, fieldId: string): void {
    const form = this.forms.get(formId);
    if (!form) throw new Error('Form not found');

    form.fields = form.fields.filter(f => f.id !== fieldId);
    form.updatedAt = new Date();
  }

  // Duplicate form
  duplicateForm(formId: string, newName: string): Form {
    const source = this.forms.get(formId);
    if (!source) throw new Error('Form not found');

    return this.createForm(source.tenantId, {
      ...source,
      name: newName,
      fields: source.fields.map(f => ({ ...f, id: crypto.randomUUID() })),
    });
  }

  // Validate form data
  validateSubmission(formId: string, data: Record<string, unknown>): {
    valid: boolean;
    errors: Record<string, string>;
  } {
    const form = this.forms.get(formId);
    if (!form) throw new Error('Form not found');

    const errors: Record<string, string> = {};

    for (const field of form.fields) {
      const value = data[field.id];

      // Required check
      if (field.required && (value === undefined || value === null || value === '')) {
        errors[field.id] = `${field.label} is required`;
        continue;
      }

      if (value === undefined || value === null) continue;

      // Type-specific validation
      const error = this.validateFieldValue(field, value);
      if (error) {
        errors[field.id] = error;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  private validateFieldValue(field: FormField, value: unknown): string | null {
    const validation = field.validation;
    if (!validation) return null;

    // String validations
    if (typeof value === 'string') {
      if (validation.minLength !== undefined && value.length < validation.minLength) {
        return `Minimum ${validation.minLength} characters required`;
      }
      if (validation.maxLength !== undefined && value.length > validation.maxLength) {
        return `Maximum ${validation.maxLength} characters allowed`;
      }
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        return 'Invalid format';
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        return `Minimum value is ${validation.min}`;
      }
      if (validation.max !== undefined && value > validation.max) {
        return `Maximum value is ${validation.max}`;
      }
    }

    // Custom validation
    if (validation.custom) {
      try {
        const fn = new Function('value', validation.custom);
        const result = fn(value);
        if (result !== true) {
          return result || 'Invalid value';
        }
      } catch (error) {
        return 'Validation error';
      }
    }

    return null;
  }

  // Check conditional visibility
  checkConditions(
    field: FormField,
    formData: Record<string, unknown>
  ): { visible: boolean; enabled: boolean; required: boolean } {
    if (!field.conditions || field.conditions.length === 0) {
      return { visible: true, enabled: true, required: !!field.required };
    }

    let visible = true;
    let enabled = true;
    let required = !!field.required;

    for (const condition of field.conditions) {
      const fieldValue = formData[condition.field];
      const conditionMet = this.evaluateCondition(fieldValue, condition.operator, condition.value);

      switch (condition.action) {
        case 'show':
          visible = conditionMet;
          break;
        case 'hide':
          visible = !conditionMet;
          break;
        case 'enable':
          enabled = conditionMet;
          break;
        case 'disable':
          enabled = !conditionMet;
          break;
        case 'require':
          required = conditionMet;
          break;
      }
    }

    return { visible, enabled, required };
  }

  private evaluateCondition(
    actual: unknown,
    operator: string,
    expected: unknown
  ): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'notEquals':
        return actual !== expected;
      case 'contains':
        return String(actual).includes(String(expected));
      case 'greaterThan':
        return Number(actual) > Number(expected);
      case 'lessThan':
        return Number(actual) < Number(expected);
      default:
        return false;
    }
  }

  // Process form submission
  async submit(formId: string, data: Record<string, unknown>, metadata: {
    ipAddress: string;
    userAgent: string;
    userId?: string;
  }): Promise<FormSubmission> {
    // Validate
    const validation = this.validateSubmission(formId, data);
    if (!validation.valid) {
      throw new Error('Validation failed: ' + JSON.stringify(validation.errors));
    }

    const form = this.forms.get(formId);
    if (!form) throw new Error('Form not found');

    // Create submission
    const submission: FormSubmission = {
      id: crypto.randomUUID(),
      formId,
      data,
      metadata: {
        ...metadata,
        submittedAt: new Date(),
      },
      status: 'pending',
    };

    // Process based on settings
    if (form.settings.saveToDatabase) {
      await this.saveSubmission(submission);
    }

    if (form.settings.emailNotifications && form.settings.emailNotifications.length > 0) {
      await this.sendNotifications(form, submission);
    }

    if (form.settings.webhooks && form.settings.webhooks.length > 0) {
      await this.triggerWebhooks(form, submission);
    }

    submission.status = 'processed';
    return submission;
  }

  // Get form by ID
  getForm(formId: string): Form | null {
    return this.forms.get(formId) || null;
  }

  // List forms for tenant
  listForms(tenantId: string): Form[] {
    return Array.from(this.forms.values()).filter(f => f.tenantId === tenantId);
  }

  // Get form submissions
  getSubmissions(formId: string, options: {
    limit?: number;
    offset?: number;
    status?: string;
  } = {}): FormSubmission[] {
    // Would fetch from database
    return [];
  }

  // Export form submissions
  async exportSubmissions(formId: string, format: 'csv' | 'json' | 'excel'): Promise<Buffer> {
    const submissions = this.getSubmissions(formId);
    const form = this.forms.get(formId);
    
    if (!form) throw new Error('Form not found');

    switch (format) {
      case 'json':
        return Buffer.from(JSON.stringify(submissions, null, 2));
      
      case 'csv':
        const headers = form.fields.map(f => f.label).join(',');
        const rows = submissions.map(s => 
          form.fields.map(f => JSON.stringify(s.data[f.id] || '')).join(',')
        );
        return Buffer.from([headers, ...rows].join('\n'));
      
      case 'excel':
        // Would use xlsx library
        return Buffer.from('');
      
      default:
        throw new Error('Unsupported format');
    }
  }

  // Private helpers
  private async saveSubmission(submission: FormSubmission): Promise<void> {
    // Would save to database
    console.log('Saved submission:', submission.id);
  }

  private async sendNotifications(form: Form, submission: FormSubmission): Promise<void> {
    for (const email of form.settings.emailNotifications || []) {
      // Would send email notification
      console.log(`Notification sent to ${email}`);
    }
  }

  private async triggerWebhooks(form: Form, submission: FormSubmission): Promise<void> {
    for (const webhook of form.settings.webhooks || []) {
      // Would trigger webhook
      console.log(`Webhook triggered: ${webhook}`);
    }
  }
}

// Form templates library
export class FormTemplates {
  private templates: Map<string, Omit<Form, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>> = new Map([
    ['contact', {
      name: 'Contact Form',
      description: 'Simple contact form for inquiries',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Full Name',
          required: true,
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          required: true,
        },
        {
          id: 'subject',
          type: 'text',
          label: 'Subject',
          required: true,
        },
        {
          id: 'message',
          type: 'textarea',
          label: 'Message',
          required: true,
          validation: { minLength: 10, maxLength: 1000 },
        },
      ],
      settings: {
        submitButtonText: 'Send Message',
        successMessage: 'Thank you for your message!',
        saveToDatabase: true,
      },
      styling: { theme: 'default' },
    }],
    ['order', {
      name: 'Order Form',
      description: 'Custom order form',
      fields: [
        {
          id: 'product',
          type: 'select',
          label: 'Product',
          required: true,
          options: [],
        },
        {
          id: 'quantity',
          type: 'number',
          label: 'Quantity',
          required: true,
          validation: { min: 1, max: 100 },
        },
        {
          id: 'notes',
          type: 'textarea',
          label: 'Special Instructions',
        },
      ],
      settings: {
        submitButtonText: 'Place Order',
        successMessage: 'Order submitted successfully!',
        saveToDatabase: true,
      },
      styling: { theme: 'card' },
    }],
    ['feedback', {
      name: 'Customer Feedback',
      description: 'Product/service feedback form',
      fields: [
        {
          id: 'rating',
          type: 'rating',
          label: 'How would you rate us?',
          required: true,
        },
        {
          id: 'feedback',
          type: 'textarea',
          label: 'Your Feedback',
        },
        {
          id: 'recommend',
          type: 'radio',
          label: 'Would you recommend us?',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ],
        },
      ],
      settings: {
        submitButtonText: 'Submit Feedback',
        successMessage: 'Thank you for your feedback!',
        saveToDatabase: true,
      },
      styling: { theme: 'minimal' },
    }],
  ]);

  getTemplate(name: string): Omit<Form, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'> | null {
    return this.templates.get(name) || null;
  }

  listTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  addTemplate(name: string, template: Omit<Form, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): void {
    this.templates.set(name, template);
  }
}

// Export singletons
export const formBuilder = new FormBuilder();
export const formTemplates = new FormTemplates();

export { Form, FormField, FieldType, FormSubmission };
