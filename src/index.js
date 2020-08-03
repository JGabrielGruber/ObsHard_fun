import admin from 'firebase-admin';

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	databaseURL: 'https://obsgpu-bot.firebaseio.com'
});

admin.database().ref('/produtos').on('child_changed', (snapshot) => {
});