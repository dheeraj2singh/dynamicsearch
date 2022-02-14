import * as _ from 'lodash';
import { SearchViewModel } from '../view-model/search.viewModel';

export class SearchModel {
    declarationIdentifier: string = "";
    transportContractIdentifier: string = "";
    modeCode: number = 0;
    statusCode: string = "";
    typeCode: string = "";
    processingStatus : string = "";
    acceptanceDateTime: {
        fromDate: Date[],
        toDate: Date[]
    };

    public patchValues(values: Partial<SearchViewModel>) {
        //assign only existing properties
        Object.keys(values).filter(key => key in this).forEach(key => this[key] = values[key]);

        if (values.acceptanceStartDateTime) {
            this.acceptanceDateTime = {
                fromDate: values.acceptanceStartDateTime,
                toDate: values.acceptanceEndDateTime ? values.acceptanceEndDateTime : null,
            };
        }
    }
}