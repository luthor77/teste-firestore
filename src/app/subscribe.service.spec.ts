import { TestBed, inject } from '@angular/core/testing';

import { SubscribeService } from './subscribe.service';
import { AngularFirestore } from 'angularfire2/firestore';

describe('SubscribeService', () => {

	let service: SubscribeService;
	let angularFireStore: AngularFirestore;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				SubscribeService,
				// para o AngularFirestore funcionar corretamente, ele precisa ser provido desta maneira
				{ provide: AngularFirestore }
			]
		});

		// serviços podem ser injetados diretamente aqui para todos os testes
		service = TestBed.get(SubscribeService)
		angularFireStore = TestBed.get(AngularFirestore);
	});


	// ou os serviços podem ser injetados em cada um dos serviços
	it('should be created', inject([SubscribeService], (service: SubscribeService) => {
		expect(service).toBeTruthy();
	}));

	it('test function should return false', () => {
		expect(service.test()).toBeFalsy();
	});

	it('testes should return string "testes"', () => {
		expect(service.testes()).toBe('testes');
	})

	// não é possível testar o  tipo de um retorno
	it('function should return observable', () => {
		(done) => {
			service.subscribeFunction().subscribe(value => {
				expect(value).toBe('observable value')
				done();
			})
		}
	})
});