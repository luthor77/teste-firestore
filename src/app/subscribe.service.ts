import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class SubscribeService {
	array = [];

	constructor(private db: AngularFirestore) {}

	// cria o observable referente ao caminho especificado
	snapShotDoc(path) {
		return this.db.doc(path).snapshotChanges()
	}

	// retorna um array asincrono que monitora as mudanças na tabela
	retornaArrayObservable() {
		return this.db.collection('clientes').stateChanges(['added', 'removed'])
			.switchMap(tfCollection => {
				let clientObs = []
				tfCollection.forEach(doc => {
					clientObs.push(this.snapShotDoc(`clientes/${doc['payload'].doc.id}`))

					// se for uma adição, coloca no array
					doc['payload'].type === 'added' ? this.pushArray(doc) :
						// se for uma remoção, remove o objeto referente a ele no array
						doc['payload'].type === 'removed' ? this.array = this.array.filter(obj => obj['key'] != doc['payload'].doc.id) :
						null
				})

				// retorna observables dos tipos de atendimento referidos nos documentos da coleção clientes
				return Observable.merge(...clientObs)
			})
			.switchMap(client => {
				const clientIndex = this.array.map(element => element.key).indexOf(client['payload'].id);

				if (this.array[clientIndex]['empresa'] != client['payload'].data()['empresa'])
					this.array[clientIndex]['empresa'] = client['payload'].data()['empresa']


				if (client['payload'].data()['tipo_atendimento']) {
					if (!this.array[clientIndex]['tipo_id'] || this.array[clientIndex]['tipo_id'] != client['payload'].data()['tipo_atendimento'].path.split('/', 2)[1])
						this.array[clientIndex]['tipo_id'] = client['payload'].data()['tipo_atendimento'].path.split('/', 2)[1]
				} else {
					if (this.array[clientIndex]['tipo'] || this.array[clientIndex]['tipo_id']) {
						this.array[clientIndex]['tipo_id'] = ''
						this.array[clientIndex]['tipo'] = ''
					}
				}

				return this.createObsReference('tipo_atendimento', 'tipo_id')
			})
			.switchMap(tipo_atendimento => {

				this.array.forEach(element => {
					if (element.tipo_id === tipo_atendimento['payload'].id) {
						if (element.tipo != tipo_atendimento['payload'].data()['tipo'])
							element.tipo = tipo_atendimento['payload'].data()['tipo']

						if (tipo_atendimento['payload'].data()['atendimento']) {
							if (!element['atendimento_id'] || element['atendimento_id'] != tipo_atendimento['payload'].data()['atendimento'].path.split('/', 2)[1]) {
								element.atendimento_id = tipo_atendimento['payload'].data()['atendimento'].path.split('/', 2)[1]
							}
						} else {
							if (element['atendimento'] || element['atendimento_id']) {
								element['atendimento'] = ''
								element['atendimento_id'] = ''
							}
						}
					}
				})

				return this.createObsReference('atendimento', 'atendimento_id')
			})
			.map(atendimento => {
				this.array.forEach(element => {
					if (element.atendimento_id == atendimento['payload'].id)
						if (element.atendimento != atendimento['payload'].data()['nome'])
							element.atendimento = atendimento['payload'].data()['nome']
				})
				
				return this.array
			})
			// impede que o async pipe crie vários subscribes se for utilizado mais de uma vez no template
			.share()
	}

	createObsReference(path, key) {
		let obsArray = []

		this.array.forEach(element => {
			if (element[key])
				obsArray.push(`${path}/${element[key]}`)
		})

		obsArray = Array.from(new Set(obsArray));

		obsArray.forEach((element, index, array) => {
			array[index] = this.snapShotDoc(element)
		})

		return Observable.merge(...obsArray)
	}

	pushArray(clientes) {
		(clientes['payload'].doc.data()['tipo_atendimento']) ?
		this.array.push({
				key: clientes['payload'].doc.id,
				empresa: clientes['payload'].doc.data()['empresa'],
				tipo_id: clientes['payload'].doc.data()['tipo_atendimento'].path.split('/', 2)[1]
			}):
			this.array.push({
				key: clientes['payload'].doc.id,
				empresa: clientes['payload'].doc.data()['empresa']
			})
	}
}