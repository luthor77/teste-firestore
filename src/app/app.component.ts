import { Component } from '@angular/core';
import { SubscribeService } from './subscribe.service';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	merge: any;
	public teste: Observable<any[]>;
	public testes = 'teste';

	constructor(private subscribeService: SubscribeService) {}

	ngOnInit() {
		// this.teste = this.subscribeService.subscribeFunction()
		this.merge = this.subscribeService.retornaArrayObservable();
	}
}

export class LightswitchComponent {
	isOn = false;
	clicked() {
		this.isOn = !this.isOn;
	}
	get message() {
		return `The light is ${this.isOn ? 'On' : 'Off'}`;
	}
}