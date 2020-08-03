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

	if (pro.modelo) {
		pro.modelo = await getData('/modelos', pro.modelo);
		if (pro.modelo.arquitetura) {
			pro.modelo.arquitetura = await getData(
				'/arquiteturas', pro.modelo.arquitetura,
			);
			pro.arquitetura = pro.modelo.arquitetura.nome;
			if (pro.modelo.arquitetura.categorias) {
				pro.modelo.arquitetura.categorias = await getData(
					'/categorias', pro.modelo.arquitetura.categorias,
				);
				pro.categoria = pro.modelo.arquitetura.categorias.nome;
			}
		}
		if (pro.modelo.marca) {
			pro.modelo.marca = await getData('/marcas', pro.modelo.marca);
			pro.marca = pro.modelo.marca.nome;
		}
		pro.ano = pro.modelo.ano;
		pro.modelo = pro.modelo.nome;
	}
	if (pro.loja) {
		pro.loja = await getData('/lojas', pro.loja);
		pro.loja = pro.loja.nome;
	}
	if (pro.variacao) {
		pro.variacao = await getData('/variacoes', pro.variacao);
		pro.variacao = pro.variacao.nome;
	}

	if (pro.precos && pro.precos.length) {
		pro.preco = pro.precos[pro.precos.length - 1];
		pro.precos.sort((a, b) => a[0] - b[0])
		pro.mPreco = pro.precos[0];
	}

	pro.update = Date.now();

	admin.firestore().collection('tabelona').doc(proS.key).set(pro);
});

admin.database().ref('/produtos').once('child_added', async (snap) => {
	const val = await snap.val();
	admin.firestore().collection('tabelona').doc(snap.key).set(val);
});