import admin from 'firebase-admin';

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	databaseURL: 'https://obsgpu-bot.firebaseio.com'
});

const getData = async (col, key = null) => {
	if (key) {
		return admin.database().ref(col).child(key).once('value').then(async (snap) => {
			const item = await snap.val();

			return { ...item, _id: snap.key };
		});
	}
	return null;
};

admin.database().ref('/produtos').on('child_changed', async (proS) => {
	const pro = proS.val();

	if (pro.modelo !== undefined) {
		pro.modelo = await getData('/modelos', pro.modelo);
		if (pro.modelo.arquitetura !== undefined) {
			pro.modelo.arquitetura = await getData(
				'/arquiteturas', pro.modelo.arquitetura,
			);
			pro.arquitetura = pro.modelo.arquitetura.nome;
			if (pro.modelo.arquitetura.categorias !== undefined) {
				pro.modelo.arquitetura.categorias = await getData(
					'/categorias', pro.modelo.arquitetura.categorias,
				);
				pro.categoria = pro.modelo.arquitetura.categorias.nome;
			}
		}
		if (pro.modelo.marca !== undefined) {
			pro.modelo.marca = await getData('/marcas', pro.modelo.marca);
			pro.marca = pro.modelo.marca.nome;
		}
		pro.ano = pro.modelo.ano;
		pro.modelo = pro.modelo.nome;
	}
	if (pro.loja !== undefined) {
		pro.loja = await getData('/lojas', pro.loja);
		pro.loja = pro.loja.nome;
	}
	if (pro.variacao !== undefined) {
		pro.variacao = await getData('/variacoes', pro.variacao);
		pro.variacao = pro.variacao.nome;
	}

	if (pro.precos && pro.precos.length) {
		pro.preco = pro.precos[pro.precos.length - 1];
		for (let i = 0, length = pro.precos.length; i < length; i++) {
			if (!pro.mPreco) {
				pro.mPreco = pro.precos[i];
			}
			if (pro.mPreco[0] < pro.precos[i][0]) {
				pro.mPreco = pro.precos[i];
			}
		}
	}

	pro.update = Date.now();
	pro.precos = undefined;

	admin.firestore().collection('tabelona').doc(proS.key).set(pro);
});

admin.database().ref('/produtos').on('child_added', async (snap) => {
	if (!(await admin.firestore().collection('produtos').select('id').where('id', '==', snap.key).get()).empty) {
	
		const pro = snap.val();

		if (pro.modelo !== undefined) {
			pro.modelo = await getData('/modelos', pro.modelo);
			if (pro.modelo.arquitetura !== undefined) {
				pro.modelo.arquitetura = await getData(
					'/arquiteturas', pro.modelo.arquitetura,
				);
				pro.arquitetura = pro.modelo.arquitetura.nome;
				if (pro.modelo.arquitetura.categorias !== undefined) {
					pro.modelo.arquitetura.categorias = await getData(
						'/categorias', pro.modelo.arquitetura.categorias,
					);
					pro.categoria = pro.modelo.arquitetura.categorias.nome;
				}
			}
			if (pro.modelo.marca !== undefined) {
				pro.modelo.marca = await getData('/marcas', pro.modelo.marca);
				pro.marca = pro.modelo.marca.nome;
			}
			pro.ano = pro.modelo.ano;
			pro.modelo = pro.modelo.nome;
		}
		if (pro.loja !== undefined) {
			pro.loja = await getData('/lojas', pro.loja);
			pro.loja = pro.loja.nome;
		}
		if (pro.variacao !== undefined) {
			pro.variacao = await getData('/variacoes', pro.variacao);
			pro.variacao = pro.variacao.nome;
		}

		if (pro.precos && pro.precos.length) {
			pro.preco = pro.precos[pro.precos.length - 1];
			for (let i = 0, length = pro.precos.length; i < length; i++) {
				if (!pro.mPreco) {
					pro.mPreco = pro.precos[i];
				}
				if (pro.mPreco[0] < pro.precos[i][0]) {
					pro.mPreco = pro.precos[i];
				}
			}
		}

		pro.update = Date.now();
		pro.precos = undefined;

		admin.firestore().collection('tabelona').doc(snap.key).set(pro);
	}
});

admin.database().ref('/produtos').on('child_removed', async (snap) => {
	admin.firestore().collection('tabelona').doc(snap.key).delete();
});