import { FormGroup } from '@angular/forms';
import { Component } from '@angular/core';
import { dataTable, JsonFormData } from './view-all/view-all.component';
import { JsonformService } from './service/jsonform.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'search';
  jsonFormData!: JsonFormData;
  listRecords: any;
  Options: [] = [];
  constructor(private jsonForm: JsonformService) {
    this.listRecords = [];
  }
  ngOnInit(): void {
    this.jsonForm.getJsonForm().subscribe((res: JsonFormData) => {
      this.jsonFormData = res;
    });
    this.getTableData();
    //this.getOption();
  }

  getTableData() {
    this.jsonForm.getTableData().subscribe((res) => {
      this.listRecords = res;
    });
  }
  getSearch(data: FormGroup) {
    this.jsonForm.searchByData(data).subscribe((res: dataTable[]) => {
      this.listRecords = res;
    });
  }
  getStatus(event: string) {
    this.jsonForm.updateFormOption(event).subscribe((res) => {
      this.getOption();
    });
  }
  getOption() {
    this.jsonForm.getOptions().subscribe((res) => {
      this.Options = res;
    });
  }
}
