import { TestBed, async, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent, LightswitchComponent } from './app.component';
import { SubscribeService } from './subscribe.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs/observable/of';
import { last } from 'rxjs/operators/last';
// import { AppModule } from './app.module';

describe('AppComponent', () => {
	let service: SubscribeService;
	let fixture: ComponentFixture < AppComponent > ;
	let app: AppComponent;
	let compiled: HTMLElement;
	let spy: jasmine.Spy;

	// // é possível criar um mock para um serviço, modificando funções existentes para que os testes funcionem imitando o serviço original
	// // mas não funciona corretamente com serviços que dependem do angularfirestore

	// class SubscribeServiceMock extends SubscribeService {
	//   constructor(private dbm: AngularFirestore) {
	//     super(dbm)
	//   }
	//   subscribeFunction() {
	//     return of([]);
	//   }
	// }

	beforeEach(async (() => {
		TestBed.configureTestingModule({
				// // É possível importar diretamente o módulo que contenha as dependências e declarations
				// // ao invés de declarar o componente
				// // também é possível importar um SharedModule
				// imports: [
				//   AppModule
				// ],
				declarations: [
					AppComponent
				],
				providers: [
					SubscribeService,
					{
						provide: AngularFirestore
					}
					// { provide: SubscribeService, useClass: SubscribeServiceMock}
				]
			})
			.compileComponents();

		fixture = TestBed.createComponent(AppComponent);
		app = fixture.debugElement.componentInstance;

		service = fixture.debugElement.injector.get(SubscribeService);
		// // TestBed é mais fácil de lembrar e escrever, mas só funciona quando o serviço é injetado dentro dos providers do TestBed
		// // enquanto pelo fixture, ele pega um serviço do componente criado, mesmo que ele não tenha sido injetado no TestBed, ou seja, sempre funciona
		// service = TestBed.get(SubscribeService);

		compiled = fixture.debugElement.nativeElement;

		// spys são usados para utilizar o serviço verdadeiro ao invés de um mock do serviço, o que permite fazer mais testes em chamadas de funções
		// ele não verifica no servidor o valor retornado, por isso é necessário retornar um mock do valor
		spy = spyOn(service, 'subscribeFunction').and.returnValue( of ());

		// se o detectChanges for chamado no beforeEach, não há necessidade de chamá-lo nos testes
		fixture.detectChanges();
	}));


	it('should create the app', async (() => {
		expect(app).toBeTruthy();
	}));

	// valores do template podem ser pegos pelo querySelector
	it('header #testeFire should have value', async (() => {
		expect(compiled.querySelector('#testeFire').textContent).toEqual('testeFire');
	}));

	// ou pelo By.css, este modo é usado para garantir que o teste funcione quando a plataforma não é um browser
	it('header #tipo_atendimento should have value', async (() => {
		const testeFire = fixture.debugElement.query(By.css('#tipo_atendimento'));
		expect(testeFire.nativeElement.textContent).toEqual('tipo_atendimento');
	}));

	it('h4 should have teste string', async (() => {
		expect(compiled.querySelector('h4').textContent).toContain(app.testes);
	}));

	it('p should return teste', async (() => {
		expect(compiled.querySelector('p').textContent).toContain(app.teste);
	}));

	// fakeAsync executa o teste de maneira similar a síncrona, mas pode executar funções assíncronas
	it('p should return teste with fakeAsync', fakeAsync(() => {
		// tick é usado para determinar uma passagem de tempo para funções asíncronas
		// como por exemplo completar um setTimeout(), mas só funciona com o fakeAsync
		tick();
		// depois do tick um detectChanges é necessário
		fixture.detectChanges();
		expect(compiled.querySelector('p').textContent).toContain(app.teste);
	}))

	// basicamente é o fakeAsync convertido para o async
	it('p should return teste with async', async (() => {
		// o tick(), é trocado pelo whenStable, deixando de ser um fluxo linear de controle
		// sendo transformado em uma promise
		fixture.whenStable().then(() => {
			// depois do tick um detectChanges é necessário
			fixture.detectChanges();
			expect(compiled.querySelector('p').textContent).toContain(app.teste);
		})
	}))

	// it('p should return teste with done', (done: DoneFn) => {
	// 	app.teste.pipe( last() ).subscribe(() => {
	// 		fixture.detectChanges();
	// 		expect(compiled.querySelector('p').textContent).toContain(app.teste);
	// 		done();
	// 	})
	// 	spy.calls.mostRecent().returnValue.subscribe(() => {
	// 		fixture.detectChanges();
			
	// 	  expect(compiled.querySelector('p').textContent).toContain(app.teste);
	// 		done();
	// 	})
	// })
});

describe('LightswitchComp', () => {
	it('#clicked() should toogle #isOn', () => {
		// components e services sem dependências são criadas com o 'new'
		const comp = new LightswitchComponent();

		// primeiro parâmetro passa o valor que a variável deveria possuir, o segundo uma mensagem
		expect(comp.isOn).toBe(false, 'off at first');
		// depois a função é chamada para alterar o valor
		comp.clicked();

		expect(comp.isOn).toBe(true, 'on after click');
		comp.clicked();

		expect(comp.isOn).toBe(false, 'off after second click');
	})

	it('#clicked() should set #message to "is on"', () => {
		const comp = new LightswitchComponent();

		// especifica a mensagem que deveria estar no método message antes do primeiro click e depois
		expect(comp.message).toMatch(/is off/i, 'off at first');
		comp.clicked();
		expect(comp.message).toMatch(/is on/i, 'on after clicked');
	});
})