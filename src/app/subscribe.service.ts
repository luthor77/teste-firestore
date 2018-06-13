import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class SubscribeService {
	array = [];

	constructor(private db: AngularFirestore) {}

	// cria o observable referente ao caminho especificado
	tipoAtendimento(path) {
		return this.db.doc(path).snapshotChanges()
	}

	// retorna um array asincrono que monitora as mudanças na tabela
	retornaArrayObservable() {
		return this.db.collection('clientes').stateChanges()
			.switchMap(tfCollection => {
				tfCollection.forEach(doc => {
					// se for uma adição, coloca no array
					doc.payload.type === 'added' ? this.pushArray(doc) :
						// se for uma alteração, modifica o array
						doc.payload.type === 'modified' ? this.modificaArray(doc) :
						// se for uma remoção, remove o objeto referente a ele no array
						doc.payload.type === 'removed' ? this.array = this.array.filter(obj => obj['key'] != doc.payload.doc.id) :
						null
				})

				// retorna observables dos tipos de atendimento referidos nos documentos da coleção clientes
				return this.createAtendimentoObs()
			})
			.map(tipo_atendimento => this.verificaArray(tipo_atendimento))
			// impede que o async pipe crie vários subscribes se for utilizado mais de uma vez no template
			.share()
	}


	createAtendimentoObs() {
		return this.db.collection('clientes').valueChanges().take(1).switchMap(tfCollection => {
			let tipo_atendimentos = [];

			tfCollection.forEach(doc => {
				doc['tipo_atendimento'] ? tipo_atendimentos.push(doc['tipo_atendimento'].path) : null
			})

			// tira as referências duplicadas do array
			tipo_atendimentos = Array.from(new Set(tipo_atendimentos))

			// transforma as referências em observables
			tipo_atendimentos.forEach((element, index, array) => {
				array[index] = this.tipoAtendimento(element)
			})

			// faz um merge entre os observables
			return Observable.merge(...tipo_atendimentos)
		})
	}

	// verifica a posição do array e o id para alterar o dado somente na posição específica quando há modificações
	// no tipo de atendimento
	verificaArray(tipo) {
		this.array.forEach(obj => {
			if (obj['id_atendimento'] === tipo['payload'].id)
				if (obj['tipo'] != tipo['payload'].data()['tipo'])
					obj['tipo'] = tipo['payload'].data()['tipo'];
		})
		return this.array
	}

	modificaArray(clientes) {
		this.array.forEach(element => {
			if (element['key'] === clientes.payload.doc.id) {
				// verifica se há a propriedade atendimento no documento
				if (clientes.payload.doc.data()['tipo_atendimento']) {
					let id = clientes.payload.doc.data()['tipo_atendimento'].path.split('/', 2)[1];
					//verifica se a propriedade atendimento possui o mesmo id do objeto no array e adiciona
					if (id != element['id_atendimento'])
						element['id_atendimento'] = id

				} else {
					// se a propriedade atendimento não existir no documento
					// verifica se a propriedade existe no objeto do array referente ao documento e exclui as propriedades relaciona
					if (element['id_atendimento']) {
						element['id_atendimento'] = ''
						element['tipo'] = ''
					}
				}

				if (element['empresa'] != clientes.payload.doc.data()['empresa'])
					element['empresa'] = clientes.payload.doc.data()['empresa']
			}
		})
	}

	pushArray(clientes) {
		// verifica se existe a propriedade atendimento no documento
		(clientes.payload.doc.data()['tipo_atendimento']) ?
		this.tipoAtendimento(clientes.payload.doc.data()['tipo_atendimento'].path).take(1).subscribe(doc => {
				this.array.push({
					key: clientes.payload.doc.id,
					id_atendimento: doc.payload.id,
					tipo: doc.payload.data()['tipo'],
					empresa: clientes.payload.doc.data()['empresa']
				})
			}):
			this.array.push({
				key: clientes.payload.doc.id,
				empresa: clientes.payload.doc.data()['empresa']
			})
	}
}