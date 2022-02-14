import { FormBuilder, FormGroup } from "@angular/forms";

export class SearchViewModel {
    formFields: FormGroup;

    declarationIdentifier: string = "";
    transportContractIdentifier: string = "";
    modeCode: number = 0;
    statusCode: string = "";
    typeCode: string = "";
    processingStatus : string = "";
    acceptanceStartDateTime: Date[] = null;
    acceptanceEndDateTime: Date[] = null;
    response: {
        identifier?: string
    } = {};

    constructor() {
        this.formFields = new FormBuilder().group(this);
    }

    public patchValues() {

        this.declarationIdentifier = this.formFields.value['declarationIdentifier'];
        this.transportContractIdentifier = this.formFields.value['transportContractIdentifier'];
        this.modeCode = this.formFields.value['modeCode'];
        this.statusCode = this.formFields.value['statusCode'];
        this.typeCode = this.formFields.value['typeCode'];
        this.processingStatus = this.formFields.value['processingStatus'];
        this.acceptanceStartDateTime = this.formFields.value['acceptanceStartDateTime'];
        this.acceptanceEndDateTime = this.formFields.value['acceptanceEndDateTime'];
    }
}