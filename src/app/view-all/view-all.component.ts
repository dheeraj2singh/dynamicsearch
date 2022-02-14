import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

interface JsonFormValidators {
  min: number;
  max: number;
  required: boolean;
  requiredTrue: boolean;
  email: boolean;
  minLength: boolean;
  maxLength: boolean;
  pattern: string;
  nullValidator: boolean;
}

interface JsonFormControls {
  id: string;
  name: string;
  label: string;
  value: string;
  type: any;
  placeholder: string;
  tooltip: string;
  showSearchInput: boolean;
  showColumn: boolean;
  iconLink: string;
  iconType: any;
  options: [];

  validators: JsonFormValidators;
}

export interface JsonFormData {
  controls: JsonFormControls[];
}
export interface dataTable {
  Manifest_registration_number: string;
  Manifest_Status: string;
  Submission_Date: string;
  Manifest_Code: string;
  action: string;
  id: number;
}

@Component({
  selector: 'app-view-all',
  templateUrl: './view-all.component.html',
  styleUrls: ['./view-all.component.less'],
})
export class ViewAllComponent implements OnInit {
  public loading: boolean = false;
  public isCollapse: boolean = true;
  public showField: boolean = false;
  public loadingList: boolean = false;
  public pageIndex: number = 1;
  public pageSize: number = 10;
  public total: number = 1;
  public resultData: [] = [];

  @Input() jsonFormData: JsonFormData = { controls: [] };
  @Input() tableData: any[];
  @Input() Options: [];
  @Output() public emitSearch: EventEmitter<FormGroup> =
    new EventEmitter<FormGroup>();
  @Output() public status: EventEmitter<string> = new EventEmitter<string>();
  public columnsToShow: string[];
  public formsToShow: string[];
  public myForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({});
    this.jsonFormData = { controls: [] };
    this.tableData = [];
    this.Options = [];
    this.columnsToShow = [];
    this.formsToShow = [];
  }
  ngOnInit(): void {}
  toggleCollapse() {
    this.isCollapse = !this.isCollapse;
    this.showField = !this.showField;
  }

  ngOnChanges(changes: SimpleChanges) {
    try {
      if (!changes['jsonFormData'].firstChange) {
        this.createForm(this.jsonFormData.controls);
      }
    } catch (error) {}
  }
  createForm(controls: JsonFormControls[]) {
    Object.values(controls).forEach((control) => {
      const validatorsToAdd = [];
      for (let [key, value] of Object.entries(control.validators)) {
        switch (key) {
          case 'min':
            validatorsToAdd.push(Validators.min(value));
            break;
          case 'max':
            validatorsToAdd.push(Validators.max(value));
            break;
          case 'required':
            if (value) {
              validatorsToAdd.push(Validators.required);
            }
            break;
          case 'requiredTrue':
            if (value) {
              validatorsToAdd.push(Validators.requiredTrue);
            }
            break;
          case 'email':
            if (value) {
              validatorsToAdd.push(Validators.email);
            }
            break;
          case 'minLength':
            validatorsToAdd.push(Validators.minLength(value));
            break;
          case 'maxLength':
            validatorsToAdd.push(Validators.maxLength(value));
            break;
          case 'pattern':
            validatorsToAdd.push(Validators.pattern(value));
            break;
          case 'nullValidator':
            if (value) {
              validatorsToAdd.push(Validators.nullValidator);
            }
            break;
          default:
            break;
        }
      }
      if (control.showColumn) {
        this.columnsToShow.push(control.label);
      }
      if (control.type === 'date') {
        control.options.forEach((date) => {
          this.myForm.addControl(date['name'], this.fb.control(date['value']));
        });
      } else {
        this.myForm.addControl(
          control.name,
          this.fb.control(control.value, validatorsToAdd)
        );
      }
    });
  }

  onSubmit() {
    this.emitSearch.emit(this.myForm);
  }

  statusChange() {
    let selected = this.myForm.get('Manifest_Status')?.value;
    this.status.emit(selected);
  }

  submitForm(reset: boolean = false) {
    if (reset) this.pageIndex = 1;
    this.resultData = [];
    this.total = this.resultData.length;
  }

  sort(sort: { key: string; value: string }) {
    console.log(sort);
  }

  resetForm() {
    console.log('reset');
    console.log(this.tableData);
    this.myForm.reset();
  }
  navigateTo(link: string, id: number, suffix: string) {}
  confirm(id: number, query: string) {}
  cancel() {}
}
