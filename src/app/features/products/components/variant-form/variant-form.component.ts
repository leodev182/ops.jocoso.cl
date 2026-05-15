import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateVariantRequest, ProductVariant } from '../../../../core/models/product.model';

@Component({
  selector: 'app-variant-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './variant-form.component.html',
  styleUrl: './variant-form.component.scss',
})
export class VariantFormComponent implements OnInit, OnChanges {
  @Input() editVariant: ProductVariant | null = null;
  @Input() copyFrom: ProductVariant | null = null;
  @Output() variantSubmit = new EventEmitter<CreateVariantRequest>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editVariant'] && this.form) {
      this.buildForm();
    }
  }

  get attributes(): FormArray {
    return this.form.get('attributes') as FormArray;
  }

  get isEditing(): boolean {
    return !!this.editVariant;
  }

  buildAttributeGroup(name = '', value = ''): FormGroup {
    return this.fb.group({
      name: [name, Validators.required],
      value: [value, Validators.required],
    });
  }

  addAttribute(): void {
    this.attributes.push(this.buildAttributeGroup());
  }

  removeAttribute(index: number): void {
    this.attributes.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.variantSubmit.emit(this.form.value as CreateVariantRequest);
    }
  }

  private buildForm(): void {
    let attrs: ReturnType<typeof this.buildAttributeGroup>[];
    let sku = '';
    let price: number | null = null;

    if (this.editVariant) {
      attrs = this.editVariant.attributes?.length
        ? this.editVariant.attributes.map(a => this.buildAttributeGroup(a.name, a.value))
        : [];
      price = Number(this.editVariant.price);
    } else if (this.copyFrom) {
      attrs = this.copyFrom.attributes?.length
        ? this.copyFrom.attributes.map(a => this.buildAttributeGroup(a.name, a.value))
        : [];
      sku = this.copyFrom.sku;
      price = Number(this.copyFrom.price);
    } else {
      attrs = [];
    }

    this.form = this.fb.group({
      sku: [{ value: sku, disabled: this.isEditing }, Validators.required],
      price: [price, [Validators.required, Validators.min(1)]],
      attributes: this.fb.array(attrs),
    });
  }
}
