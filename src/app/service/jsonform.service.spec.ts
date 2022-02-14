import { TestBed } from '@angular/core/testing';

import { JsonformService } from './jsonform.service';

describe('JsonformService', () => {
  let service: JsonformService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsonformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
