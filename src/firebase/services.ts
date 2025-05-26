import { ref, push, set } from 'firebase/database';
import { database } from './config';

// Função para salvar dados da Loja Física
export const saveLojaFisicaData = async (data: any) => {
  try {
    const lojaFisicaRef = ref(database, 'atendimentos/loja-fisica');
    const newLojaFisicaRef = push(lojaFisicaRef);
    
    // Adiciona timestamp ao registro
    const dataWithTimestamp = {
      ...data,
      timestamp: new Date().toISOString(),
      createdAt: Date.now()
    };
    
    await set(newLojaFisicaRef, dataWithTimestamp);
    return { success: true, id: newLojaFisicaRef.key };
  } catch (error) {
    console.error('Erro ao salvar dados da Loja Física:', error);
    return { success: false, error };
  }
};

// Função para salvar dados do WhatsApp/Instagram
export const saveWhatsappData = async (data: any) => {
  try {
    const whatsappRef = ref(database, 'atendimentos/whatsapp-instagram');
    const newWhatsappRef = push(whatsappRef);
    
    // Adiciona timestamp ao registro
    const dataWithTimestamp = {
      ...data,
      timestamp: new Date().toISOString(),
      createdAt: Date.now()
    };
    
    await set(newWhatsappRef, dataWithTimestamp);
    return { success: true, id: newWhatsappRef.key };
  } catch (error) {
    console.error('Erro ao salvar dados do WhatsApp/Instagram:', error);
    return { success: false, error };
  }
};

// Função para salvar dados do Caixa
export const saveCaixaData = async (data: any) => {
  try {
    const caixaRef = ref(database, 'atendimentos/caixa');
    const newCaixaRef = push(caixaRef);
    
    // Adiciona timestamp ao registro
    const dataWithTimestamp = {
      ...data,
      timestamp: new Date().toISOString(),
      createdAt: Date.now()
    };
    
    await set(newCaixaRef, dataWithTimestamp);
    return { success: true, id: newCaixaRef.key };
  } catch (error) {
    console.error('Erro ao salvar dados do Caixa:', error);
    return { success: false, error };
  }
};
