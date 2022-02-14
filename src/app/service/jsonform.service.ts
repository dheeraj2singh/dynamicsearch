import { JsonFormData } from '../view-all/view-all.component';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { dataTable } from '../view-all/view-all.component';

@Injectable({
  providedIn: 'root',
})
export class JsonformService {
  constructor(private http: HttpClient) {}
  private jsonFormUrl: string = 'http://localhost:3000/jsonForms';
  private tableUrl: string = 'http://localhost:3000/data';
  private Options: string = 'http://localhost:3000/Options';
  private manifest_Code_Options: string =
    'http://localhost:3000/Manifest_Code_Options';

  getJsonForm(): Observable<JsonFormData> {
    return this.http.get<JsonFormData>(`${this.jsonFormUrl}`);
  }

  getTableData() {
    return this.http.get(`${this.tableUrl}`);
  }

  searchByData(data: FormGroup): Observable<dataTable[]> {
    return this.http.get<dataTable[]>(
      `${this.tableUrl}?
      Manifest_registration_number=` +
        data.value.Manifest_registration_number +
        `&Manifest_Status=` +
        data.value.Manifest_Status
    );
  }
  updateFormOption(label: string) {
    let showOption: boolean = false;
    if (label == 'active') {
      showOption = false;
    } else if (label == 'in process') {
      showOption = true;
    }
    let obj = {
      optionName: 'Manifest_Code',
      optionList: [
        {
          id: 1,
          label: '--select--',
          selected: 'true',
          disabled: true,
          showOption: true,
          value: '--select--',
        },
        {
          id: 2,
          label: 'active',
          selected: 'false',
          disabled: false,
          showOption: showOption,
          value: 'active',
        },
        {
          id: 3,
          label: 'completed',
          selected: 'false',
          disabled: false,
          showOption: true,
          value: 'in process',
        },
      ],
    };

    return this.http.put(`${this.Options}/2`, obj);
  }

  getOptions(): Observable<[]> {
    return this.http.get<[]>(`${this.Options}`);
  }
  get_Manifest_Code_Options() {
    return this.http.get(`${this.manifest_Code_Options}`);
  }
}
