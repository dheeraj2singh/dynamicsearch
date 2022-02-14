import { AttachDocumentsService } from 'base-shared';
import { HistoryViewModel } from '../view-model/history.viewModel';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { ClientService } from '../services/client.service';
import * as wco from '../interfaces/wco';
import * as _ from 'lodash';
import { RdmState } from '../store/rdm.state';
import { HeaderInfoViewModel } from '../view-model/headerInfo.viewModel';
import { ShippingViewModel } from '../view-model/shipping.viewModel';
import { InvoiceViewModel } from '../view-model/invoice.viewModel';
import { GoodsDetailsViewModel } from '../view-model/goodsDetails.viewModel';
import { OnFormAction } from '../interfaces/form-action';
import { NzNotificationService } from 'ng-zorro-antd';
import { SummaryViewModel } from '../view-model/summary.viewModel';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class DeclarationModel implements wco.DeclarationDto {
    formAction: OnFormAction;
    formFields: FormGroup;
    page: wco.Page;
    id?: number;
    stage?: boolean;
    classification?: string;

    acceptanceDateTime?: Date;
    cancellationDateTime?: Date;
    effectiveDateTime?: Date;
    expirationDateTime?: Date;
    functionCode?: number;
    functionalReferenceID: string;
    identifier?: string;
    issueDateTime?: Date;
    issueLocationID?: string;
    languageCode?: string;
    rejectionDateTime?: Date;
    specificCircumstancesCode: string;
    statusCode?: string;
    subsequentDeclarationOfficeID: string;
    transportMovementCode: string;
    typeCode?: string;
    versionID?: string;
    additionalDocuments?: wco.AdditionalDocumentDto[];
    additionalInformations?: wco.AdditionalInformationDto[];
    agents?: wco.AgentDto[];
    amendments?: wco.AmendmentDto[];
    borderTransportMeanses?: wco.BorderTransportMeansDto[];
    consignments?: wco.ConsignmentDto[];
    controls?: wco.ControlDto[];
    currencyExchanges?: wco.CurrencyExchangeDto[];
    dutyTaxFees?: wco.DutyTaxFeeDto[];
    goodsShipments?: wco.GoodsShipmentDto[];
    loadingLocations?: wco.LoadingLocationDto[];
    submitters?: wco.SubmitterDto[];
    processingStatus? : string;

    uploadedFile?: any;
    isUploaded?: boolean = true;
    classificationList: any = ["Submit", "Amend", "Addition"];
    functionCodeList: any = [
        { text: "Submit", value: 9, color: "#52c41a" },
        { text: "Amend", value: 52, color: "#52c41a" },
        { text: "Cancel", value: 1, color: "#f5222d" },
        { text: "Addition", value: 2, color: "#52c41a" }];
    statusCodeList: any = [
        { text: "Accepted", value: 1, color: "#52c41a", icon: "carry-out" },
        { text: "Rejected", value: 8, color: "#f5222d", icon: "close-circle" },
        { text: "Cancelled", value: 23, color: "#f5222d", icon: "close-circle" },
        { text: "Provisional", value: 29, color: "#faad14", icon: "diff" },
        { text: "Document Incomplete", value: 35, color: "#faad14", icon: "file-text" },
        { text: "Document Complete", value: 37, color: "#52c41a", icon: "file-unknown" }];

    processingStatusCode : any = [
        {code :'PCREL',label : "Pending Release"},
        {code :'PPYMT',label : "Pending Payment"},
        {code :'PENAP',label : "Pending for approval"},
        {code :'PINSP',label : "Pending Inspection"},
        {code :'REL',label : "Released"},
        {code : 'PENGM' ,label :"Pending Gate Movement"}
    ]    

    @Select(RdmState.getSchema) schema$: Observable<any>;
    constructor(
        private fb: FormBuilder,
       private notification: NzNotificationService,
       private attachmentService: AttachDocumentsService,
        private clientService: ClientService) {

        this.stage = true;
        this.classification = "Submit";
        this.page = wco.Page.Declaration;
        this.formFields = this.fb.group({});
        this.prepareFormGroup();
    }

    prepareFormGroup() {
        let clazzData = [];
        let schemaData = [];
        this.schema$.subscribe(schema => {
            schemaData = schema;
        });
        for (let clazz in schemaData) {
            for (let field in schemaData[clazz]) {
                let ob1 = {};
                ob1[clazz] = schemaData[clazz];
                clazzData.push(ob1);
            }
        }
        clazzData.forEach(fields => {
            for (let field in fields) {
                this.formFields.addControl(field, this.fb.group(this.prepareFormControl(fields[field])));
            }
        });
        return this.formFields;
    }

    prepareFormControl(attributes) {
        let formGroupConfig: any = {};
        for (let attribute in attributes) {
            if (!_.isEmpty(attributes[attribute]['validations']) && !_.isEmpty(attributes[attribute]['validations']['pattern'])) {
                if (attributes[attribute]['mandatory'] == true)
                    formGroupConfig[attribute] = new FormControl('', [Validators.required, Validators.pattern(attributes[attribute]['validations']['pattern'])]);
                else
                    formGroupConfig[attribute] = new FormControl('', [Validators.pattern(attributes[attribute]['validations']['pattern'])]);
            } else {
                if (attributes[attribute]['mandatory'] == true)
                    formGroupConfig[attribute] = new FormControl('', [Validators.required]);
                else
                    formGroupConfig[attribute] = new FormControl('', []);
            }
        }
        return formGroupConfig;
    }

    public patchValues(values: Partial<wco.DeclarationDto | HeaderInfoViewModel | ShippingViewModel | InvoiceViewModel | GoodsDetailsViewModel>): Observable<wco.DeclarationDto> {
        if (values instanceof HeaderInfoViewModel) {
            this.page = wco.Page.HeaderInfo;
        } else if (values instanceof ShippingViewModel) {
            this.page = wco.Page.Shipping;
        } else if (values instanceof InvoiceViewModel) {
            this.page = wco.Page.Financial;
        } else if (values instanceof GoodsDetailsViewModel) {
            this.page = wco.Page.GoodsDetails;
        } else {
            this.stage = false;
            this.page = wco.Page.Declaration;
        }
        const model = new Observable<wco.DeclarationDto>(observer => {
            this.clientService.saveDeclaration(this.getRequest(), this.id, this.classification).subscribe((res: wco.DeclarationDto) => {
                if (res) {
                    _.merge(this, res);
                    observer.next(res);
                    if (!_.isEmpty(res.additionalDocuments)) {
                        res.additionalDocuments.forEach((docs ,index) => {
                            if (this.isUploaded && docs && docs.binaryFile && docs.binaryFile.id && values['binaryFile'])
                                this.UploadFile(docs.binaryFile.id , index);
                        });
                    }
                }
            }, (error) => { observer.error(error); });
        });
        return model;
    }

    public loadValues(formId: string): Observable<wco.DeclarationDto> {
        const model = new Observable<wco.DeclarationDto>(observer => {
            if (formId !== 'null') {
                this.clientService.declarationById(formId).subscribe((res: wco.DeclarationDto) => {
                    if (res) {
                        _.merge(this, res);
                        observer.next(res);
                    }
                });
            } else {
                let newDeclaration = <wco.DeclarationDto>{};
                observer.next(newDeclaration);
            }
        });
        return model;
    }

    public loadVersions(identifier: string): Observable<any> {
        const versions = new Observable(observer => {
            this.clientService.getAllVersions(identifier).subscribe((res) => {
                observer.next(res);
            });
        });
        return versions;
    }

    private getRequest() {
        let req = _.cloneDeep(this);
        delete req['fb'];
        delete req['clientService'];
        delete req['formFields'];
        delete req['formAction'];
        delete req['__schema$__selector'];
        delete req['schema$'];
        delete req['classificationList'];
        delete req['functionCodeList'];
        delete req['statusCodeList'];
        delete req['processingStatusCode'];
        delete req['uploadedFile'];
        delete req['UploadDoc'];
        delete req['handleChange'];
        delete req['UploadFile'];
        delete req['isUploaded'];
        delete req['notification'];
        delete req['attachmentService'];
        return req;
    }

    public setFormAction(form: OnFormAction) {
        this.formAction = form;
    }

    public getCurrentFormData() {
        return this.formAction.getFormData();
    }

    public resetForm() {
        this.formFields.reset();
        HeaderInfoViewModel.onDestroy();
        ShippingViewModel.onDestroy();
        InvoiceViewModel.onDestroy();
        GoodsDetailsViewModel.onDestroy();
        SummaryViewModel.onDestroy();
        HistoryViewModel.onDestroy();

        let req = this.getRequest();
        Object.keys(req).filter(key => key in req).forEach(key => this[key] = null);
        this.stage = true;
        this.classification = "Submit";
        this.page = wco.Page.Declaration;
    }

    public UploadDoc = (item) => {
        this.uploadedFile = new FormData();
        this.uploadedFile.append('file', item.file as any);
    };

    public UploadFile(id: number , index :number) {
        this.attachmentService.uploadDocumentsSingle(environment.wso2amEndPoint + "/declaration" + environment.wso2amApiVersion + "/api/v1/declarations/binary/upload?id="+id, 'UpdateHeaderInfoComponent',index,'file' )
        .then((res)=>{
          console.log(res,"Sucesss");
        },(error)=>{
          console.log(error,"errrrrrrrrrror");
        });

        // return this.clientService.uploadBinary(uploadedFile, id).subscribe((event) => {
        //     this.isUploaded = false;
        //     uploadedFile.onSuccess(event.body, uploadedFile.file, event);
        // }, (err) => {
        //     this.isUploaded = false;
        // });
    }

    public handleChange({ file, fileList }: { [key: string]: any }): void {
           file.status = "done";
    }

}
