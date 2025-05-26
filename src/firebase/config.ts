import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Configuração do Firebase com as credenciais fornecidas pelo usuário
const firebaseConfig = {
  apiKey: "AIzaSyOHQgIxk5pR-sbDqHe1yBeK7CvdWMRLgN",
  authDomain: "masmu-controle.firebaseapp.com",
  projectId: "masmu-controle",
  storageBucket: "masmu-controle.firebasestorage.app",
  messagingSenderId: "484896227279",
  appId: "1:484896227279:web:7229cf5ea3903947791cba",
  databaseURL: "https://masmu-controle-default-rtdb.firebaseio.com"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore
export const firestore = getFirestore(app);

// Inicializa o Realtime Database
export const database = getDatabase(app);

export default app;
