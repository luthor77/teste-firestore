import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class SubscribeService {
	array = [];
	merge: any;

	constructor(private db: AngularFirestore) {}

	// cria o observable do tipo de atendimento
	tipoAtendimento(path) {
		return this.db.doc(path).snapshotChanges()
	}

	retornaArrayObservable() {
		return this.db.collection('testeFire').stateChanges()
			.flatMap(tfCollection => {
				let tipoAtendimento

				tfCollection.forEach(doc => {
					switch (doc.payload.type) {
						case 'added':
							{
								// cria um observable unindo os observables de cada tipo de atendimento
								if (doc.payload.doc.data()['atendimento']) {
									tipoAtendimento = this.reDoMerge()
									this.pushArray(doc)
								} else {
									this.array.push({
										key: doc.payload.doc.id,
										teste: doc.payload.doc.data()['teste']
									})
								}

								break;
							}
						case 'modified':
							{
								tipoAtendimento = this.modificaArray(doc)
								break;
							}
					}
				})

				return tipoAtendimento
			})
			.map(tipo_atendimento => {
				console.log(tipo_atendimento['payload'].data()['tipo']);

				return this.verificaArray(tipo_atendimento)
			})
			// impede que o async pipe crie vários subscribes se for utilizado mais de uma vez no template
			.share()

	}

	reDoMerge() {
		return this.db.collection('testeFire').valueChanges().take(1).switchMap(tfCollection => {
			let tipoAtendimento = [];

			tfCollection.forEach(doc => {
				if (doc['atendimento']) {
					tipoAtendimento.push(doc['atendimento'].path)
				}
			})

			let uniqueArray = tipoAtendimento.filter(function(item, pos, self) {
				return self.indexOf(item) === pos;
			})

			tipoAtendimento = []

			uniqueArray.forEach(element => {
				tipoAtendimento.push(this.tipoAtendimento(element))
			})

			return Observable.merge(...tipoAtendimento)
		})
	}

	// verifica a posição do array e o id para alterar o dado somente na posição específica
	verificaArray(tipo) {
		this.array.forEach(obj => {
			if (obj['id_atendimento'] === tipo['payload'].id) {
				obj['tipo'] = tipo['payload'].data()['tipo'];
			}
		})
		return this.array
	}

	modificaArray(testeFire) {
		for (const obj in this.array) {
			if (this.array.hasOwnProperty(obj)) {
				// verifica se há um objeto no array referente ao documento
				if (this.array[obj]['key'] === testeFire.payload.doc.id) {
					// verifica se há a propriedade atendimento no documento
					if (testeFire.payload.doc.data()['atendimento']) {
						let id = testeFire.payload.doc.data()['atendimento'].path.split('/', 2);
						//verifica se a propriedade atendimento possui o mesmo id do objeto no array e adiciona
						if (id[1] != this.array[obj]['id_atendimento']) {
							this.array[obj]['id_atendimento'] = id[1]
						}
						// se a propriedade atendimento não existir no documento
					} else {
						// verifica se a propriedade existe no objeto do array referente ao documento e exclui as propriedades relacionas
						if (this.array[obj]['id_atendimento']) {
							delete this.array[obj]['id_atendimento']
							delete this.array[obj]['tipo']
						}
					}

					if (this.array[obj]['teste'] != testeFire.payload.doc.data()['teste']) {
						this.array[obj]['teste'] = testeFire.payload.doc.data()['teste']
					}
				}
			}
		}

		return this.reDoMerge()
	}

	// preenche o array
	pushArray(testeFire) {
		this.tipoAtendimento(testeFire.payload.doc.data()['atendimento'].path).take(1).subscribe(doc => {
			this.array.push({
				key: testeFire.payload.doc.id,
				id_atendimento: doc.payload.id,
				tipo: doc.payload.data()['tipo'],
				teste: testeFire.payload.doc.data()['teste']
			})
		})
	}
}