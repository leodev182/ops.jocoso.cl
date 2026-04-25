import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateVariantRequest } from '../../../../core/models/product.model';

@Component({
  selector: 'app-variant-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './variant-form.component.html',
  styleUrl: './variant-form.component.scss',
})
export class VariantFormComponent implements OnInit {
  @Output() variantSubmit = new EventEmitter<CreateVariantRequest>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      sku: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(1)]],
      attributes: this.fb.array([this.buildAttributeGroup()]),
    });
  }

  get attributes(): FormArray {
    return this.form.get('attributes') as FormArray;
  }

  buildAttributeGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      value: ['', Validators.required],
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
      this.form.reset();
    }
  }
}
