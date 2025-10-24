import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, push, onValue, remove, get, query, orderByChild, equalTo, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ########## ATENÇÃO!! ##########
// COLE SUA CHAVE DE API AQUI NOVAMENTE
const firebaseConfig = {
  apiKey: "AIzaSyCPNd9INqIfqG1-rjaYAlz988RLDZvL528", 
  authDomain: "hells-angels-438c2.firebaseapp.com",
  databaseURL: "https.://hells-angels-438c2-default-rtdb.firebaseio.com/",
  projectId: "hells-angels-438c2",
  storageBucket: "hells-angels-438c2.firebasestorage.app",
  messagingSenderId: "429406215315",
  appId: "1:429406215315:web:96b68b172247824b308166",
  measurementId: "G-CR415MEY32"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let vendas = [];
let vendaEmEdicaoId = null;
let vendaOriginalRegistradoPor = null;
let vendaOriginalRegistradoPorId = null;
let vendaOriginalTimestamp = null;
let vendaOriginalDataHora = null;
let vendaOriginalDossierOrg = null; 
let vendaOriginalCliente = null;
let vendaOriginalOrganizacao = null; 

let currentUser = null;
let currentUserData = null; 

let globalAllOrgs = []; 
let globalCurrentPeople = [];
let sortableInstance = null; 
let orgSortableInstance = null; 

let tempVeiculos = {};
let veiculoEmEdicaoKey = null; 

const perUnit = {
  tickets: { dinheiro_sujo: 525 },
  tablets: { cobre: 20, plastico: 40, fita_adesiva: 2, lixo_eletronico: 2 },
  nitro: { aluminio: 20, cobre: 20, vidro: 45, fita_adesiva: 1, porca: 1, parafuso: 1 }
};

const valores = {
  tablets: { limpo: 17000, sujo: 20000, limpo_alianca: 15000, sujo_alianca: 18000 },
  tickets: { limpo: 9800, sujo: 11700, limpo_alianca: 8000, sujo_alianca: 10000 },
  nitro: { limpo: 42500, sujo: 50000, limpo_alianca: 38000, sujo_alianca: 45000 }
};

const valorDescricao = {
    'limpo': 'Dinheiro Limpo',
    'sujo': 'Dinheiro Sujo',
    'limpo_alianca': 'Limpo (Aliança)',
    'sujo_alianca': 'Sujo (Aliança)'
};

const logoLightModeSrc = "logo-dark.png";
const logoDarkModeSrc = "logo-dark.png";
const historyBackgroundSrc = "logo-dark.png";
const welcomeLogoSrc = "logo-dark.png";

const els = {
  qtyTickets: document.getElementById('qtyTickets'),
  qtyTablets: document.getElementById('qtyTablets'),
  qtyNitro: document.getElementById('qtyNitro'),
  tipoValor: document.getElementById('tipoValor'),
  nomeCliente: document.getElementById('nomeCliente'),
  organizacao: document.getElementById('organizacao'),
  organizacaoTipo: document.getElementById('organizacaoTipo'),
  telefone: document.getElementById('telefone'),
  carroVeiculo: document.getElementById('carroVeiculo'), 
  placaVeiculo: document.getElementById('placaVeiculo'),
  negociadoras: document.getElementById('negociadoras'),
  vendaValorObs: document.getElementById('vendaValorObs'),
  dataVenda: document.getElementById('dataVenda'),
  filtroHistorico: document.getElementById('filtroHistorico'),
  resultsBody: document.getElementById('resultsBody'),
  valuesBody: document.getElementById('valuesBody'),
  valorTotalGeral: document.getElementById('valorTotalGeral'),
  results: document.getElementById('results'),
  mainCard: document.getElementById('mainCard'),
  historyCard: document.getElementById('historyCard'),
  salesHistory: document.getElementById('salesHistory'),
  calcBtn: document.getElementById('calcBtn'),
  resetBtn: document.getElementById('resetBtn'),
  registerBtn: document.getElementById('registerBtn'),
  toggleHistoryBtn: document.getElementById('toggleHistoryBtn'),
  toggleCalcBtn: document.getElementById('toggleCalcBtn'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  csvBtn: document.getElementById('csvBtn'),
  discordBtnCalc: document.getElementById('discordBtnCalc'),
  themeBtn: document.getElementById('themeBtn'),
  tutorialBtn: document.getElementById('tutorialBtn'),
  logoLink: document.getElementById('logoLink'),
  appLogo: document.getElementById('appLogo'),
  historyImg: document.getElementById('historyImg'),
  welcomeScreen: document.getElementById('welcomeScreen'),
  enterBtn: document.getElementById('enterBtn'),
  welcomeLogo: document.getElementById('welcomeLogo'),
  authScreen: document.getElementById('authScreen'),
  username: document.getElementById('username'),
  password: document.getElementById('password'),
  loginBtn: document.getElementById('loginBtn'),
  registerUserBtn: document.getElementById('registerUserBtn'),
  authMessage: document.getElementById('authMessage'),
  logoutBtn: document.getElementById('logoutBtn'),
  mainTitle: document.getElementById('mainTitle'),
  forgotPasswordLink: document.getElementById('forgotPasswordLink'),
  
  adminPanelBtn: document.getElementById('adminPanelBtn'),
  adminPanel: document.getElementById('adminPanel'),
  adminUserListBody: document.getElementById('adminUserListBody'),
  toggleCalcBtnAdmin: document.getElementById('toggleCalcBtnAdmin'), 
  
  onlineUsersCount: document.getElementById('onlineUsersCount'),
  layoutToggleNightMode: document.getElementById('layoutToggleNightMode'),
  layoutToggleBottomPanel: document.getElementById('layoutToggleBottomPanel'),
  bottomPanelText: document.getElementById('bottomPanelText'),
  saveBottomPanelTextBtn: document.getElementById('saveBottomPanelTextBtn'),
  bottomPanelDisplay: document.getElementById('bottomPanelDisplay'),
  
  bottomPanel: document.getElementById('bottomPanel'),
  userStatus: document.getElementById('userStatus'),
  
  investigacaoBtn: document.getElementById('investigacaoBtn'),
  dossierCard: document.getElementById('dossierCard'),
  toggleCalcBtnDossier: document.getElementById('toggleCalcBtnDossier'),
  
  dossierOrgContainer: document.getElementById('dossierOrgContainer'),
  filtroDossierOrgs: document.getElementById('filtroDossierOrgs'),
  addOrgBtn: document.getElementById('addOrgBtn'),
  dossierOrgGrid: document.getElementById('dossierOrgGrid'),
  
  dossierPeopleContainer: document.getElementById('dossierPeopleContainer'),
  dossierPeopleTitle: document.getElementById('dossierPeopleTitle'),
  dossierVoltarBtn: document.getElementById('dossierVoltarBtn'),
  filtroDossierPeople: document.getElementById('filtroDossierPeople'),
  addPessoaBtn: document.getElementById('addPessoaBtn'),
  dossierPeopleGrid: document.getElementById('dossierPeopleGrid'),
  
  migrateDossierBtn: document.getElementById('migrateDossierBtn'),
  migrateVeiculosBtn: document.getElementById('migrateVeiculosBtn'), 
  
  editDossierOverlay: document.getElementById('editDossierOverlay'),
  editDossierModal: document.getElementById('editDossierModal'),
  editDossierOrg: document.getElementById('editDossierOrg'),
  editDossierId: document.getElementById('editDossierId'),
  editDossierNome: document.getElementById('editDossierNome'),
  editDossierNumero: document.getElementById('editDossierNumero'),
  editDossierCargo: document.getElementById('editDossierCargo'),
  editDossierFotoUrl: document.getElementById('editDossierFotoUrl'),
  editDossierInstagram: document.getElementById('editDossierInstagram'), 
  saveDossierBtn: document.getElementById('saveDossierBtn'),
  cancelDossierBtn: document.getElementById('cancelDossierBtn'),
  
  editModalCarroNome: document.getElementById('editModalCarroNome'),
  editModalCarroPlaca: document.getElementById('editModalCarroPlaca'),
  editModalCarroFoto: document.getElementById('editModalCarroFoto'), 
  editModalAddVeiculoBtn: document.getElementById('editModalAddVeiculoBtn'),
  editModalCancelVeiculoBtn: document.getElementById('editModalCancelVeiculoBtn'), 
  editModalListaVeiculos: document.getElementById('editModalListaVeiculos'),
  
  addDossierOverlay: document.getElementById('addDossierOverlay'),
  addDossierModal: document.getElementById('addDossierModal'),
  addDossierOrganizacao: document.getElementById('addDossierOrganizacao'),
  addDossierNome: document.getElementById('addDossierNome'),
  addDossierNumero: document.getElementById('addDossierNumero'),
  addDossierCargo: document.getElementById('addDossierCargo'),
  addDossierFotoUrl: document.getElementById('addDossierFotoUrl'),
  saveNewDossierBtn: document.getElementById('saveNewDossierBtn'),
  cancelNewDossierBtn: document.getElementById('cancelNewDossierBtn'),

  addModalCarroNome: document.getElementById('addModalCarroNome'),
  addModalCarroPlaca: document.getElementById('addModalCarroPlaca'),
  addModalCarroFoto: document.getElementById('addModalCarroFoto'), 
  addModalAddVeiculoBtn: document.getElementById('addModalAddVeiculoBtn'),
  addModalCancelVeiculoBtn: document.getElementById('addModalCancelVeiculoBtn'), 
  addModalListaVeiculos: document.getElementById('addModalListaVeiculos'),
  
  orgModalOverlay: document.getElementById('orgModalOverlay'),
  orgModal: document.getElementById('orgModal'),
  orgModalTitle: document.getElementById('orgModalTitle'),
  editOrgId: document.getElementById('editOrgId'),
  orgNome: document.getElementById('orgNome'),
  orgFotoUrl: document.getElementById('orgFotoUrl'),
  orgInfo: document.getElementById('orgInfo'),
  saveOrgBtn: document.getElementById('saveOrgBtn'),
  cancelOrgBtn: document.getElementById('cancelOrgBtn'),
  deleteOrgBtn: document.getElementById('deleteOrgBtn'),
  
  imageLightboxOverlay: document.getElementById('imageLightboxOverlay'),
  imageLightboxModal: document.getElementById('imageLightboxModal'),
  lightboxImg: document.getElementById('lightboxImg')
};

// =================================================================
// INÍCIO: NOVAS FUNÇÕES DE CONFIGURAÇÃO GLOBAL E STATUS ONLINE
// (Contém a lógica de rastreamento de atividade e leitura de configurações globais)
// =================================================================

const globalLayoutRef = ref(db, 'configuracoesGlobais/layout');

// Listener que atualiza o layout para todos os usuários
onValue(globalLayoutRef, (snapshot) => {
    if (!snapshot.exists()) {
        console.warn("Nó /configuracoesGlobais/layout não encontrado. Criando...");
        if(currentUserData && currentUserData.tag.toUpperCase() === 'ADMIN') {
             set(globalLayoutRef, { enableNightMode: true, enableBottomPanel: false, bottomPanelText: 'Este é o painel inferior.' });
        }
        return;
    }
    const settings = snapshot.val();
    
    if (els.themeBtn) {
        els.themeBtn.style.display = settings.enableNightMode ? 'block' : 'none';
        if (!settings.enableNightMode && document.body.classList.contains('dark')) {
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }
    
    if (els.bottomPanel) {
        els.bottomPanel.style.display = settings.enableBottomPanel ? 'flex' : 'none';
        els.bottomPanelDisplay.textContent = settings.bottomPanelText || 'Este é o painel inferior.'; 
    }
    
    if (els.adminPanel.style.display !== 'none' && els.bottomPanelText) {
         els.bottomPanelText.value = settings.bottomPanelText || '';
    }

}, (error) => {
    if(error.code !== "PERMISSION_DENIED") {
        showToast(`Erro ao carregar configurações de layout: ${error.message}`, 'error');
    }
});

const updateUserActivity = () => {
    if (currentUser) {
        const activityRef = ref(db, `onlineStatus/${currentUser.uid}`);
        
        set(activityRef, {
            lastActive: Date.now(),
            displayName: currentUser.displayName,
            tag: currentUserData ? currentUserData.tag : 'N/A'
        }).catch(e => {
             console.warn("Erro ao registrar atividade online:", e.message);
        });
        
        setTimeout(updateUserActivity, 30000); 
    }
};

const countOnlineUsers = () => {
    const statusRef = ref(db, 'onlineStatus');
    
    let listener;
    if (countOnlineUsers.listener) {
         listener = countOnlineUsers.listener;
    }
    
    listener = onValue(statusRef, (snapshot) => {
        if (!snapshot.exists()) {
            els.onlineUsersCount.textContent = '0';
            return;
        }
        
        const now = Date.now();
        const activeThreshold = 60000;
        let activeCount = 0;
        
        snapshot.forEach(child => {
            const userStatus = child.val();
            if (userStatus.lastActive && (now - userStatus.lastActive) < activeThreshold) {
                activeCount++;
            }
        });
        
        els.onlineUsersCount.textContent = activeCount.toString();
        
    }, {});
    
    countOnlineUsers.listener = listener;
};

// =================================================================
// FIM: NOVAS FUNÇÕES DE CONFIGURAÇÃO GLOBAL E STATUS ONLINE
// (O restante do código abaixo é a lógica completa de Vendas e Dossiê)
// =================================================================

const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) { return 'R$ 0'; }
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const capitalizeText = (text) => {
    if (!text) return '';
    const upperText = text.toUpperCase();
    if (upperText === 'CPF' || upperText === 'OUTROS' || upperText === 'CNPJ' || upperText === 'NKT') {
        return upperText;
    }
    if (text === 'dinheiro sujo') return 'Dinheiro Sujo';
    return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const showToast = (message, type = 'default', duration = 3000) => {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => { toast.classList.add('show'); }, 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, duration);
};

const getQty = (element) => Math.max(0, parseInt(element.value) || 0);

const PREFIX = "(055) ";
const phoneMask = (value) => {
    let digits = value.replace(/\D/g, ""); 
    if (digits.startsWith("055")) { digits = digits.substring(3); }
    digits = digits.substring(0, 6); 
    let formattedNumber = digits.length > 3 ? `${digits.substring(0, 3)}-${digits.substring(3)}` : digits;
    return PREFIX + formattedNumber;
}

const camposTelefone = [els.telefone, els.editDossierNumero, els.addDossierNumero];

camposTelefone.forEach(campo => {
    if (campo) {
        campo.addEventListener('input', (e) => {
            e.target.value = e.target.value.length < PREFIX.length ? PREFIX : phoneMask(e.target.value);
        });
        campo.addEventListener('focus', (e) => {
            if (!e.target.value || e.target.value.length < PREFIX.length) { e.target.value = PREFIX; }
        });
    }
});

const atualizarRelogio = () => {
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    els.dataVenda.value = `${dia}/${mes}/${ano} ${horas}:${minutos}`;
};
atualizarRelogio();
setInterval(atualizarRelogio, 30000);

const camposParaCapitalizar = [ 
    els.nomeCliente, els.organizacao, els.negociadoras, els.vendaValorObs, 
    els.carroVeiculo, 
    els.addDossierNome, els.addDossierOrganizacao, els.addDossierCargo, 
    els.editDossierNome, els.editDossierCargo, 
    els.orgNome,
    els.addModalCarroNome, els.editModalCarroNome 
];
camposParaCapitalizar.forEach(campo => {
  if (campo) {
    campo.addEventListener('input', (e) => {
      const { selectionStart, selectionEnd } = e.target;
      e.target.value = capitalizeText(e.target.value);
      e.target.setSelectionRange(selectionStart, selectionEnd);
    });
  }
});

if (els.editDossierInstagram) {
    els.editDossierInstagram.addEventListener('input', (e) => {
      // Deixa o usuário digitar livremente
    });
}

const calculate = () => {
  const { qtyTickets, qtyTablets, qtyNitro, tipoValor } = {
    qtyTickets: getQty(els.qtyTickets),
    qtyTablets: getQty(els.qtyTablets),
    qtyNitro: getQty(els.qtyNitro),
    tipoValor: els.tipoValor.value
  };
  const totalQuantities = { cobre: 0, plastico: 0, fita_adesiva: 0, lixo_eletronico: 0, aluminio: 0, vidro: 0, porca: 0, parafuso: 0, dinheiro_sujo: 0 };
  let totalValue = 0;
  const productValues = [];
  
  if (qtyTablets > 0) {
    totalQuantities.cobre += qtyTablets * perUnit.tablets.cobre;
    totalQuantities.plastico += qtyTablets * perUnit.tablets.plastico;
    totalQuantities.fita_adesiva += qtyTablets * perUnit.tablets.fita_adesiva;
    totalQuantities.lixo_eletronico += qtyTablets * perUnit.tablets.lixo_eletronico;
    const value = qtyTablets * valores.tablets[tipoValor];
    totalValue += value;
    productValues.push({ product: `Tablets (${qtyTablets} und.)`, value });
  }
  if (qtyTickets > 0) {
    totalQuantities.dinheiro_sujo += qtyTickets * perUnit.tickets.dinheiro_sujo;
    const value = qtyTickets * valores.tickets[tipoValor];
    totalValue += value;
    productValues.push({ product: `Tickets (${qtyTickets} und.)`, value });
  }
  if (qtyNitro > 0) {
    totalQuantities.aluminio += qtyNitro * perUnit.nitro.aluminio;
    totalQuantities.cobre += qtyNitro * perUnit.nitro.cobre;
    totalQuantities.vidro += qtyNitro * perUnit.nitro.vidro;
    totalQuantities.fita_adesiva += qtyNitro * perUnit.nitro.fita_adesiva;
    totalQuantities.porca += qtyNitro * perUnit.nitro.porca;
    totalQuantities.parafuso += qtyNitro * perUnit.nitro.parafuso;
    const value = qtyNitro * valores.nitro[tipoValor];
    totalValue += value;
    productValues.push({ product: `Nitro (${qtyNitro} und.)`, value });
  }
  
  const hasQuantities = qtyTickets > 0 || qtyTablets > 0 || qtyNitro > 0;
  if (hasQuantities) {
    updateResults(totalQuantities, productValues, totalValue);
  } else {
    els.results.style.display = 'none';
  }
  return { qtyTickets, qtyTablets, qtyNitro, totalValue, tipoValor, hasQuantities };
};

const updateResults = (totals, productValues, totalValue) => {
  els.results.style.display = 'block';
  els.resultsBody.innerHTML = Object.entries(totals)
    .filter(([, value]) => value > 0)
    .map(([material, value]) => `<tr><td>${capitalizeText(material.replace(/_/g, ' '))}</td><td>${value.toLocaleString('pt-BR')}</td></tr>`)
    .join('');
  els.valuesBody.innerHTML = productValues.map(item => `<tr><td>${item.product}</td><td>${formatCurrency(item.value)}</td></tr>`).join('');
  els.valorTotalGeral.textContent = formatCurrency(totalValue);
};

const clearAllFields = () => {
  ['qtyTickets', 'qtyTablets', 'qtyNitro', 'nomeCliente', 'organizacao', 'negociadoras', 'vendaValorObs', 'carroVeiculo', 'placaVeiculo'].forEach(id => els[id].value = '');
  els.tipoValor.value = 'limpo';
  els.organizacaoTipo.value = 'CNPJ';
  els.telefone.value = '';
  els.results.style.display = 'none';
  document.querySelectorAll('.input-invalido').forEach(input => input.classList.remove('input-invalido'));
  
  if (vendaEmEdicaoId) {
    vendaEmEdicaoId = null;
    vendaOriginalRegistradoPor = null;
    vendaOriginalRegistradoPorId = null;
    vendaOriginalTimestamp = null;
    vendaOriginalDataHora = null;
    vendaOriginalCliente = null; 
    vendaOriginalOrganizacao = null; 
    vendaOriginalDossierOrg = null; 
    els.registerBtn.textContent = 'Registrar Venda';
  }
};

const validateFields = () => {
    let isValid = true;
    const camposObrigatorios = [ els.nomeCliente, els.telefone, els.negociadoras ];
    
    camposObrigatorios.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('input-invalido');
            isValid = false;
        } else {
            field.classList.remove('input-invalido');
        }
    });
    
    const tipoOrg = els.organizacaoTipo.value;
    if (tipoOrg === 'CNPJ') {
        if (!els.organizacao.value.trim()) {
            els.organizacao.classList.add('input-invalido');
            isValid = false;
        } else {
            els.organizacao.classList.remove('input-invalido');
        }
    } else {
        els.organizacao.classList.remove('input-invalido');
    }
    
    return isValid;
};

const findDossierEntryGlobal = async (nome) => {
    if (!nome) return null;
    
    try {
        const dossiesRef = ref(db, 'dossies');
        const snapshot = await get(dossiesRef);
        
        if (!snapshot.exists()) return null;
        
        const dossies = snapshot.val();
        
        for (const orgKey in dossies) {
            const orgData = dossies[orgKey];
            for (const personId in orgData) {
                if (orgData[personId].nome && orgData[personId].nome.toLowerCase() === nome.toLowerCase()) {
                    return {
                        personData: orgData[personId],
                        oldOrg: orgKey,
                        personId: personId
                    };
                }
            }
        }
    } catch (error) {
        if(error.code !== "PERMISSION_DENIED") {
            console.error("Erro na busca global:", error);
        }
        return null;
    }
    return null; 
};

const searchAllPeopleGlobal = async (query) => {
    if (!query) return [];
    
    const results = [];
    const queryLower = query.toLowerCase();
    
    try {
        const dossiesRef = ref(db, 'dossies');
        const snapshot = await get(dossiesRef);
        
        if (!snapshot.exists()) return [];
        
        const dossies = snapshot.val();
        
        for (const orgKey in dossies) {
            const orgData = dossies[orgKey];
            for (const personId in orgData) {
                const person = orgData[personId];
                const nome = person.nome ? person.nome.toLowerCase() : '';
                
                if (nome.includes(queryLower)) {
                    results.push({
                        ...person,
                        id: personId,
                        org: orgKey 
                    });
                }
            }
        }
    } catch (error) {
        if(error.code !== "PERMISSION_DENIED") {
            console.error("Erro na busca global de pessoas:", error);
        }
    }
    return results;
};

const parseAndMergeVeiculos = (vendaData, existingVeiculos = {}) => {
    const carros = (vendaData.carro || '').split(',').map(c => c.trim());
    const placas = (vendaData.placas || '').split(',').map(p => p.trim());
    const maxLen = Math.max(carros.length, placas.length);
    
    const merged = { ...existingVeiculos }; 

    for (let i = 0; i < maxLen; i++) {
        const carro = carros[i] || 'N/A';
        const placa = placas[i] || '';
        
        if (placa) {
            if (!merged[placa]) { 
                merged[placa] = { carro: carro, placa: placa, fotoUrl: '' };
            } else if (carro !== 'N/A' && merged[placa].carro === 'N/A') {
                merged[placa].carro = carro;
            }
        } else if (carro !== 'N/A') {
            const tempKey = `venda_${Date.now()}_${i}`;
            merged[tempKey] = { carro: carro, placa: '', fotoUrl: '' };
        }
    }
    return merged;
};


const addDossierEntry = async (vendaData, dadosAntigos = null) => {
    const org = vendaData.organizacao.trim();
    const nome = vendaData.cliente.trim();
    
    if (!org || !nome) {
        console.warn("addDossierEntry: Org ou Nome faltando. Saindo.");
        return;
    }

    const orgRef = ref(db, `organizacoes/${org}`);
    get(orgRef).then(snapshot => {
        if (!snapshot.exists()) {
            set(orgRef, {
                nome: org,
                fotoUrl: '',
                info: 'Base registrada automaticamente via Venda.',
                ordemIndex: 9999 
            });
        }
    });

    const dossierQuery = query(ref(db, `dossies/${org}`), orderByChild('nome'), equalTo(nome));
    
    try {
        const snapshot = await get(dossierQuery);
        
        if (snapshot.exists()) {
            let existingEntryId;
            let existingEntryData;
            snapshot.forEach(child => { 
                existingEntryId = child.key; 
                existingEntryData = child.val(); 
            });

            const updates = {};
            
            updates.numero = vendaData.telefone || existingEntryData.numero;
            updates.cargo = vendaData.vendaValorObs || existingEntryData.cargo;
            updates.data = vendaData.dataHora; 
            
            const baseVeiculos = (dadosAntigos ? dadosAntigos.veiculos : existingEntryData.veiculos) || {};
            updates.veiculos = parseAndMergeVeiculos(vendaData, baseVeiculos);

            if (dadosAntigos) {
                updates.fotoUrl = dadosAntigos.fotoUrl || existingEntryData.fotoUrl || '';
                updates.instagram = dadosAntigos.instagram || existingEntryData.instagram || '';
                updates.hierarquiaIndex = dadosAntigos.hierarquiaIndex !== undefined ? dadosAntigos.hierarquiaIndex : (existingEntryData.hierarquiaIndex !== undefined ? existingEntryData.hierarquiaIndex : 9999);
            }

            const updateRef = ref(db, `dossies/${org}/${existingEntryId}`);
            await update(updateRef, updates);

        } else {
            const dossierEntry = { ...dadosAntigos };
            
            dossierEntry.nome = vendaData.cliente;
            dossierEntry.numero = vendaData.telefone;
            dossierEntry.organizacao = org;
            dossierEntry.cargo = vendaData.vendaValorObs || 'N/A';
            dossierEntry.data = vendaData.dataHora; 
            
            dossierEntry.veiculos = parseAndMergeVeiculos(vendaData, (dadosAntigos ? dadosAntigos.veiculos : {}));

            dossierEntry.fotoUrl = dossierEntry.fotoUrl || '';
            dossierEntry.instagram = dossierEntry.instagram || '';
            dossierEntry.hierarquiaIndex = dossierEntry.hierarquiaIndex !== undefined ? dossierEntry.hierarquiaIndex : 9999;
            
            await push(ref(db, `dossies/${org}`), dossierEntry);
        }
    } catch (err) {
        console.error("Erro ao adicionar/atualizar dossiê:", err);
        if(err.code !== "PERMISSION_DENIED") {
            showToast(`Erro ao sincronizar dossiê: ${err.message}`, "error");
        }
    }
};

const updateDossierEntryOnEdit = async (oldNome, oldOrg, newVendaData) => {
    const newOrg = newVendaData.organizacao.trim();
    const newNome = newVendaData.cliente.trim();
    
    if (!oldOrg || !oldNome || !newOrg || !newNome) {
        console.warn("UpdateDossier: Faltando dados originais ou novos.");
        return;
    }

    const dossierQuery = query(ref(db, `dossies/${oldOrg}`), orderByChild('nome'), equalTo(oldNome));
    
    try {
        const snapshot = await get(dossierQuery);
        
        if (!snapshot.exists()) {
            const globalEntry = await findDossierEntryGlobal(newNome);
            
            let dadosAntigos = null;
            if (globalEntry && globalEntry.oldOrg !== newOrg) {
                dadosAntigos = globalEntry.personData;
                await remove(ref(db, `dossies/${globalEntry.oldOrg}/${globalEntry.personId}`));
                showToast(`"${newNome}" movido de "${globalEntry.oldOrg}" para "${newOrg}".`, "default", 4000);
            }
            
            addDossierEntry(newVendaData, dadosAntigos);
            return;
        }

        let existingEntryId;
        let existingEntryData;
        snapshot.forEach(child => { 
            existingEntryId = child.key;
            existingEntryData = child.val();
        });
        
        const newDossierData = {
            ...existingEntryData, 
            nome: newVendaData.cliente,
            numero: newVendaData.telefone,
            organizacao: newVendaData.organizacao,
            cargo: newVendaData.vendaValorObs || 'N/A',
            data: newVendaData.dataHora,
            veiculos: parseAndMergeVeiculos(newVendaData, existingEntryData.veiculos || {}),
        };

        if (oldOrg === newOrg) {
            const updateRef = ref(db, `dossies/${newOrg}/${existingEntryId}`);
            await set(updateRef, newDossierData); 
        } else {
            await remove(ref(db, `dossies/${oldOrg}/${existingEntryId}`));
            addDossierEntry(newVendaData, existingEntryData); 
        }

    } catch (err) {
        console.error("Erro ao sincronizar edição da venda com dossiê:", err);
        if(err.code !== "PERMISSION_DENIED") {
            showToast(`Erro ao sincronizar dossiê: ${err.message}`, "error");
        }
    }
};

const autoFillFromDossier = async () => {
    if (vendaEmEdicaoId) return; 
    const nome = els.nomeCliente.value.trim();
    if (!nome) return; 

    try {
        const foundEntry = await findDossierEntryGlobal(nome);
        
        if (foundEntry && foundEntry.personData) {
            const data = foundEntry.personData;
            const orgBase = foundEntry.oldOrg;

            els.telefone.value = data.numero || '';
            els.vendaValorObs.value = data.cargo || ''; 
            
            if (orgBase.toUpperCase() === 'CPF') {
                els.organizacaoTipo.value = 'CPF';
                els.organizacao.value = ''; 
            } else if (orgBase.toUpperCase() === 'OUTROS') {
                els.organizacaoTipo.value = 'OUTROS';
                els.organizacao.value = ''; 
            } else {
                els.organizacaoTipo.value = 'CNPJ';
                els.organizacao.value = orgBase; 
            }
            
            showToast(`Dados de "${nome}" preenchidos do dossiê.`, "success");
        }
        
    } catch (error) {
        if(error.code !== "PERMISSION_DENIED") {
            console.error("Erro ao tentar auto-preencher:", error);
            showToast("Erro ao buscar dados do dossiê.", "error");
        }
    }
};

const registerVenda = async () => {
  const { qtyTickets, qtyTablets, qtyNitro, totalValue, tipoValor, hasQuantities } = calculate();
  if (!hasQuantities) {
    showToast("É necessário calcular a venda antes de registrar.", "error");
    return;
  }
  if (!validateFields()) {
      showToast("Preencha os campos obrigatórios (marcados em vermelho).", "error");
      return;
  }
  if (!currentUser || !currentUser.displayName) {
      showToast("Erro: Usuário não autenticado.", "error");
      return;
  }
  
  const carro = els.carroVeiculo.value.trim();
  const placas = els.placaVeiculo.value.trim().toUpperCase();
  
  const newVenda = {
    timestamp: vendaEmEdicaoId ? vendaOriginalTimestamp : Date.now(), 
    dataHora: vendaEmEdicaoId ? vendaOriginalDataHora : new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
    cliente: els.nomeCliente.value.trim(),
    organizacao: els.organizacao.value.trim(),
    organizacaoTipo: els.organizacaoTipo.value,
    telefone: els.telefone.value.trim(),
    negociadoras: els.negociadoras.value.trim(),
    vendaValorObs: els.vendaValorObs.value.trim(),
    carro: carro, 
    placas: placas,
    qtyTickets, qtyTablets, qtyNitro,
    valorTotal: totalValue,
    tipoValor,
    registradoPor: vendaEmEdicaoId ? vendaOriginalRegistradoPor : currentUser.displayName,
    registradoPorId: vendaEmEdicaoId ? vendaOriginalRegistradoPorId : currentUser.uid 
  };
  
  
  let dossierOrgDestino = '';
  if (newVenda.organizacaoTipo === 'CPF') {
      dossierOrgDestino = 'CPF';
  } else if (newVenda.organizacaoTipo === 'OUTROS') {
      dossierOrgDestino = 'Outros';
  } else { 
      dossierOrgDestino = newVenda.organizacao.trim();
  }
  
  let dadosAntigosParaMover = null;
  
  if (!vendaEmEdicaoId && dossierOrgDestino !== '' && newVenda.cliente !== '') {
      try {
          const existingEntry = await findDossierEntryGlobal(newVenda.cliente);
          
          if (existingEntry && existingEntry.oldOrg !== dossierOrgDestino) {
              
              dadosAntigosParaMover = { ...existingEntry.personData };
              
              await remove(ref(db, `dossies/${existingEntry.oldOrg}/${existingEntry.personId}`));
              
              showToast(`"${newVenda.cliente}" movido de "${existingEntry.oldOrg}" para "${dossierOrgDestino}".`, "default", 4000);
          }
      } catch (e) {
          if (e.code !== "PERMISSION_DENIED") {
              showToast(`Erro ao verificar dossiê global: ${e.message}`, "error");
          }
      }
  }
  

  const operation = vendaEmEdicaoId ? set(ref(db, `vendas/${vendaEmEdicaoId}`), newVenda) : push(ref(db, 'vendas'), newVenda);
  
  operation
      .then(() => {
          showToast(`Venda ${vendaEmEdicaoId ? 'atualizada' : 'registrada'} com sucesso!`, "success");
          
          const dossierVendaData = { ...newVenda }; 
          dossierVendaData.organizacao = dossierOrgDestino;

          if (dossierOrgDestino !== '') {
              if (vendaEmEdicaoId) {
                  updateDossierEntryOnEdit(vendaOriginalCliente, vendaOriginalDossierOrg, dossierVendaData);
              } else {
                  addDossierEntry(dossierVendaData, dadosAntigosParaMover);
              }
          }
          
          clearAllFields();
      })
      .catch((error) => {
          showToast(`Erro ao registrar venda: ${error.message}`, "error");
      });
};

const editVenda = (id) => {
    const venda = vendas.find(v => v.id === id);
    if (!venda) return;
    
    els.nomeCliente.value = venda.cliente || '';
    els.organizacao.value = venda.organizacao || '';
    els.organizacaoTipo.value = venda.organizacaoTipo || 'CNPJ';
    els.telefone.value = venda.telefone || '';
    els.negociadoras.value = venda.negociadoras || '';
    els.vendaValorObs.value = venda.vendaValorObs || '';
    els.tipoValor.value = venda.tipoValor || 'limpo';
    
    els.carroVeiculo.value = venda.carro || ''; 
    els.placaVeiculo.value = venda.placas || ''; 
    
    els.qtyTickets.value = venda.qtyTickets || 0;
    els.qtyTablets.value = venda.qtyTablets || 0;
    els.qtyNitro.value = venda.qtyNitro || 0;
    
    calculate(); 
    
    vendaEmEdicaoId = id;
    vendaOriginalRegistradoPor = venda.registradoPor;
    vendaOriginalRegistradoPorId = venda.registradoPorId;
    vendaOriginalTimestamp = venda.timestamp;
    vendaOriginalDataHora = venda.dataHora;
    
    vendaOriginalCliente = venda.cliente;
    vendaOriginalOrganizacao = venda.organizacao; 
    
    if (venda.organizacaoTipo === 'CPF') {
        vendaOriginalDossierOrg = 'CPF';
    } else if (venda.organizacaoTipo === 'OUTROS') {
        vendaOriginalDossierOrg = 'Outros';
    } else {
        vendaOriginalDossierOrg = venda.organizacao;
    }
    
    els.registerBtn.textContent = 'Atualizar Venda';
    toggleView('main'); 
    showToast(`Editando venda de ${venda.cliente}`, "default");
};

const removeVenda = (id) => {
    if (confirm("Tem certeza que deseja remover esta venda?")) {
        remove(ref(db, `vendas/${id}`))
            .then(() => {
                showToast("Venda removida.", "success");
            })
            .catch((error) => {
                showToast(`Erro ao remover: ${error.message}`, "error");
            });
    }
};

const buildDiscordMessage = (vendaData) => {
    const { cliente, data, orgTipo, org, tel, produtos, valor, obs, negociadoras, cargo } = vendaData;
    return `
\`\`\`
Nome: ${cliente}
Data: ${data}
Organização: ${orgTipo} - ${org}
Telefone: ${tel}
Cargo: ${cargo}
Produto (Unidade): ${produtos}
Venda Valor: ${valor} (${obs})
Negociadoras: ${negociadoras}
\`\`\`
    `.trim();
};

const copyDiscordMessage = (isFromHistory = false, venda = null) => {
    let messageData;
    if (isFromHistory) {
        let produtos = [];
        if (venda.qtyTickets > 0) produtos.push(`Tickets (${venda.qtyTickets})`);
        if (venda.qtyTablets > 0) produtos.push(`Tablet (${venda.qtyTablets})`);
        if (venda.qtyNitro > 0) produtos.push(`Nitros (${venda.qtyNitro})`);
        
        messageData = {
            cliente: venda.cliente,
            data: venda.dataHora.split(', ')[0],
            orgTipo: venda.organizacaoTipo,
            org: venda.organizacao,
            tel: venda.telefone,
            cargo: venda.vendaValorObs || 'N/A',
            produtos: produtos.join(', '),
            valor: formatCurrency(venda.valorTotal || 0),
            obs: valorDescricao[venda.tipoValor],
            negociadoras: venda.negociadoras
        };
    } else {
        const { qtyTickets, qtyTablets, qtyNitro, totalValue, tipoValor, hasQuantities } = calculate();
        if (!hasQuantities) { showToast("Calcule uma venda antes de copiar.", "error"); return; }
        if (!validateFields()) { showToast("Preencha os dados da venda antes de copiar.", "error"); return; }
        
        let produtos = [];
        if (qtyTickets > 0) produtos.push(`Tickets (${qtyTickets})`);
        if (qtyTablets > 0) produtos.push(`Tablet (${qtyTablets})`);
        if (qtyNitro > 0) produtos.push(`Nitros (${qtyNitro})`);
        
        const dataAtual = new Date().toLocaleDateString('pt-BR');

        messageData = {
            cliente: els.nomeCliente.value.trim(),
            data: dataAtual,
            orgTipo: els.organizacaoTipo.value,
            org: els.organizacao.value.trim(),
            tel: els.telefone.value.trim(),
            cargo: els.vendaValorObs.value.trim() || 'N/A',
            produtos: produtos.join(', '),
            valor: formatCurrency(totalValue),
            obs: valorDescricao[tipoValor],
            negociadoras: els.negociadoras.value.trim()
        };
    }
    navigator.clipboard.writeText(buildDiscordMessage(messageData))
      .then(() => {
        showToast("Mensagem copiada para o Discord!", "success");
      })
      .catch(err => {
        showToast("Erro ao copiar.", "error");
      });
};

const toggleView = (viewName) => {
    els.mainCard.style.display = 'none';
    els.historyCard.style.display = 'none';
    els.adminPanel.style.display = 'none';
    els.dossierCard.style.display = 'none';
    
    document.body.classList.remove('history-view-active', 'dossier-view-active');

    if (viewName === 'history') {
        document.body.classList.add('history-view-active');
        els.historyCard.style.display = 'block';
        els.historyImg.src = historyBackgroundSrc;
        els.filtroHistorico.value = ''; 
        displaySalesHistory(vendas); 
    } else if (viewName === 'admin') {
        els.adminPanel.style.display = 'block';
        loadAdminPanel();
        countOnlineUsers();
    } else if (viewName === 'dossier') {
        document.body.classList.add('dossier-view-active');
        els.dossierCard.style.display = 'block';
        showDossierOrgs(); 
    } else {
        els.mainCard.style.display = 'block';
    }
};

const displaySalesHistory = (history) => {
    els.salesHistory.innerHTML = '';
    if (!currentUserData) { 
         return;
    }

    let vendasFiltradas = history;
    const userTagUpper = currentUserData.tag.toUpperCase();
    
    if (userTagUpper === 'VISITANTE') {
        vendasFiltradas = history.filter(v => v.registradoPorId === currentUser.uid);
    }

    if (vendasFiltradas.length === 0) {
        const row = els.salesHistory.insertRow();
        row.insertCell().colSpan = 9; 
        row.cells[0].textContent = "Nenhuma venda para exibir.";
        row.cells[0].style.textAlign = 'center';
        row.cells[0].style.padding = '20px';
        return;
    }

    vendasFiltradas.sort((a, b) => b.timestamp - a.timestamp);

    vendasFiltradas.forEach(venda => {
        const row = els.salesHistory.insertRow();
        
        const [data, hora] = venda.dataHora.split(', ');
        row.insertCell().innerHTML = `<span class="history-datetime-line">${data}</span><span class="history-datetime-line">${hora}</span>`;
        row.insertCell().textContent = capitalizeText(venda.cliente);
        row.insertCell().textContent = `${capitalizeText(venda.organizacao)} (${venda.organizacaoTipo})`;
        row.insertCell().textContent = venda.telefone;

        let produtos = [];
        if (venda.qtyTickets > 0) produtos.push(`${venda.qtyTickets} Tickets`);
        if (venda.qtyTablets > 0) produtos.push(`${venda.qtyTablets} Tablets`);
        if (venda.qtyNitro > 0) produtos.push(`${venda.qtyNitro} Nitro`);
        row.insertCell().textContent = capitalizeText(produtos.join(', '));
        
        const valorCell = row.insertCell();
        valorCell.className = 'valor-total-cell';
        valorCell.innerHTML = `<span>${formatCurrency(venda.valorTotal || 0)}</span><span class="valor-obs-text">(${valorDescricao[venda.tipoValor] || 'N/A'})`;

        row.insertCell().textContent = capitalizeText(venda.negociadoras);
        
        const registradoPorCell = row.insertCell();
        if (venda.registradoPor && venda.registradoPor.toLowerCase() === 'snow') {
            registradoPorCell.textContent = '???';
            registradoPorCell.style.fontStyle = 'italic';
            registradoPorCell.style.color = '#aaa';
        } else {
            registradoPorCell.textContent = venda.registradoPor || 'Desconhecido';
        }
        
        const actionsCell = row.insertCell();
        actionsCell.className = 'history-actions-cell';

        const podeModificar = 
            (userTagUpper === 'ADMIN') ||
            (userTagUpper === 'HELLS' && venda.registradoPorId === currentUser.uid) ||
            (userTagUpper === 'VISITANTE' && venda.registradoPorId === currentUser.uid);

        actionsCell.innerHTML = `
            <button class="action-btn muted edit-btn" ${!podeModificar ? 'disabled' : ''}>Editar</button>
            <button class="action-btn danger delete-btn" ${!podeModificar ? 'disabled' : ''}>Deletar</button>
            <button class="action-btn muted discord-btn">Discord</button>
        `;
        if(podeModificar){
            actionsCell.querySelector('.edit-btn').onclick = () => editVenda(venda.id);
            actionsCell.querySelector('.delete-btn').onclick = () => removeVenda(venda.id);
        }
        actionsCell.querySelector('.discord-btn').onclick = () => copyDiscordMessage(true, venda);
    });
};

const filterHistory = () => {
    const query = els.filtroHistorico.value.toLowerCase().trim();
    const filteredVendas = vendas.filter(v => 
        Object.values(v).some(val => String(val).toLowerCase().includes(query)) ||
        (v.qtyTickets > 0 && `tickets`.includes(query)) ||
        (v.qtyTablets > 0 && `tablets`.includes(query)) ||
        (v.qtyNitro > 0 && `nitro`.includes(query))
    );
    displaySalesHistory(query ? filteredVendas : vendas);
};

const exportToCsv = () => {
    if (vendas.length === 0) {
        showToast("Nenhum dado para exportar.", "error");
        return;
    }
    const headers = ["Data/Hora", "Cliente", "Organização", "Tipo", "Telefone", "Negociadoras", "Cargo", "Carro", "Placas", "Qtde Tickets", "Qtde Tablets", "Qtde Nitro", "Valor Total", "Tipo Valor", "Registrado Por"];
    const csvRows = vendas.map(v => [`"${v.dataHora}"`, `"${v.cliente}"`, `"${v.organizacao}"`, `"${v.organizacaoTipo}"`, `"${v.telefone}"`, `"${v.negociadoras}"`, `"${v.vendaValorObs}"`, `"${v.carro || ''}"`, `"${v.placas || ''}"`, v.qtyTickets, v.qtyTablets, v.qtyNitro, v.valorTotal, `"${valorDescricao[v.tipoValor]}"`, `"${v.registradoPor}"`].join(','));
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
    link.download = `historico_vendas_HA_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast("Histórico exportado para CSV!", "success");
};

const clearHistory = () => {
    if (currentUserData.tag.toUpperCase() !== 'ADMIN') {
        showToast("Apenas administradores podem limpar o histórico.", "error");
        return;
    }
    if (confirm("ATENÇÃO: Deseja APAGAR TODO o histórico de vendas? Esta ação é irreversível.")) {
        remove(ref(db, 'vendas'))
            .then(() => showToast("Histórico limpado.", "success"))
            .catch(e => showToast(`Erro: ${e.message}`, "error"));
    }
};

const showImageLightbox = (url) => {
    if (!url) return;
    els.lightboxImg.src = url;
    els.imageLightboxOverlay.style.display = 'block';
    els.imageLightboxModal.style.display = 'block';
};

const closeImageLightbox = () => {
    els.imageLightboxOverlay.style.display = 'none';
    els.imageLightboxModal.style.display = 'none';
    els.lightboxImg.src = ''; 
};

const saveHierarchyOrder = (orgName) => {
    const grid = els.dossierPeopleGrid;
    const children = Array.from(grid.children);
    
    if (children.length === 0 || !children[0].classList.contains('dossier-entry-card')) {
        return; 
    }
    
    const updates = {};
    children.forEach((card, index) => {
        const personId = card.dataset.id;
        if (personId) {
            updates[`dossies/${orgName}/${personId}/hierarquiaIndex`] = index;
        }
    });
    
    if (Object.keys(updates).length > 0) {
        update(ref(db), updates)
            .then(() => {
                showToast("Hierarquia atualizada!", "success");
                globalCurrentPeople = children.map((card, index) => {
                    const person = globalCurrentPeople.find(p => p.id === card.dataset.id);
                    if (person) {
                        person.hierarquiaIndex = index;
                    }
                    return person;
                }).filter(Boolean);
            })
            .catch((err) => {
                showToast(`Erro ao salvar hierarquia: ${err.message}`, "error");
            });
    }
};

const initSortable = (orgName) => {
    if (sortableInstance) {
        sortableInstance.destroy(); 
    }
    
    const grid = els.dossierPeopleGrid;
    
    const userTagUpper = currentUserData ? currentUserData.tag.toUpperCase() : 'VISITANTE';
    const canDrag = (userTagUpper === 'ADMIN' || userTagUpper === 'HELLS');
    
    sortableInstance = new Sortable(grid, {
        animation: 150,
        handle: '.dossier-entry-card', 
        disabled: !canDrag, 
        ghostClass: 'sortable-ghost', 
        onEnd: (evt) => {
            saveHierarchyOrder(orgName);
        }
    });
};

const saveOrgOrder = () => {
    const grid = els.dossierOrgGrid;
    const children = Array.from(grid.children).filter(el => el.classList.contains('dossier-org-card'));
    
    if (children.length === 0) {
        return;
    }
    
    const updates = {};
    children.forEach((card, index) => {
        const orgId = card.dataset.orgName;
        if (orgId) {
            updates[`organizacoes/${orgId}/ordemIndex`] = index;
        }
    });
    
    if (Object.keys(updates).length > 0) {
        update(ref(db), updates)
            .then(() => {
                showToast("Ordem das Bases atualizada!", "success");
                globalAllOrgs = children.map((card, index) => {
                    const org = globalAllOrgs.find(o => o.id === card.dataset.orgName);
                    if (org) {
                        org.ordemIndex = index;
                    }
                    return org;
                }).filter(Boolean);
            })
            .catch((err) => {
                showToast(`Erro ao salvar ordem das Bases: ${err.message}`, "error");
            });
    }
};

const initOrgSortable = () => {
    if (orgSortableInstance) {
        orgSortableInstance.destroy();
    }
    
    const grid = els.dossierOrgGrid;
    
    const userTagUpper = currentUserData ? currentUserData.tag.toUpperCase() : 'VISITANTE';
    const canDrag = (userTagUpper === 'ADMIN' || userTagUpper === 'HELLS');
    
    orgSortableInstance = new Sortable(grid, {
        animation: 150,
        handle: '.dossier-org-card', 
        group: 'orgs', 
        disabled: !canDrag, 
        ghostClass: 'sortable-ghost',
        filter: 'h3.dossier-org-title', 
        onEnd: (evt) => {
            saveOrgOrder();
        }
    });
};

const showDossierOrgs = async () => {
    els.dossierOrgContainer.style.display = 'block';
    els.dossierPeopleContainer.style.display = 'none';
    els.dossierOrgGrid.innerHTML = '<p>Carregando organizações...</p>';
    globalAllOrgs = [];
    
    try {
        const orgsInfoRef = ref(db, 'organizacoes');
        const orgsInfoSnap = await get(orgsInfoRef);
        const orgsInfo = orgsInfoSnap.exists() ? orgsInfoSnap.val() : {};
        
        const orgsPessoasRef = ref(db, 'dossies');
        const orgsPessoasSnap = await get(orgsPessoasRef);
        const orgsPessoas = orgsPessoasSnap.exists() ? orgsPessoasSnap.val() : {};

        const allOrgNames = new Set([...Object.keys(orgsInfo), ...Object.keys(orgsPessoas)]);
        
        if (allOrgNames.size === 0) {
            els.dossierOrgGrid.innerHTML = '<p>Nenhuma organização encontrada. Clique em "+ Adicionar Base" para começar.</p>';
            initOrgSortable(); 
            return;
        }
        
        globalAllOrgs = Array.from(allOrgNames).map(orgName => {
            const info = orgsInfo[orgName] || {};
            return {
                id: orgName,
                nome: orgName,
                ordemIndex: info.ordemIndex !== undefined ? info.ordemIndex : 9999,
                ...info
            };
        }).sort((a, b) => {
             const indexA = a.ordemIndex !== undefined ? a.ordemIndex : Infinity;
             const indexB = b.ordemIndex !== undefined ? b.ordemIndex : Infinity;
             if (indexA !== indexB) {
                return indexA - indexB; 
             }
             return a.nome.localeCompare(b.nome); 
        });
        
        displayOrgs(globalAllOrgs);
        initOrgSortable(); 
        
    } catch (error) {
        els.dossierOrgGrid.innerHTML = `<p style="color: var(--cor-erro);">Erro ao carregar organizações: ${error.message}</p>`;
    }
};

const displayOrgs = (orgs) => {
    els.dossierOrgGrid.innerHTML = '';
    if (orgs.length === 0) {
        els.dossierOrgGrid.innerHTML = '<p>Nenhuma organização encontrada para este filtro.</p>';
        return;
    }
    
    orgs.forEach(org => {
        const card = document.createElement('div');
        card.className = 'dossier-org-card';
        card.dataset.orgName = org.nome;
        
        const fotoDiv = document.createElement('div');
        fotoDiv.className = 'dossier-org-foto';
        if (org.fotoUrl) {
            const img = document.createElement('img');
            img.src = org.fotoUrl;
            img.alt = `Base de ${org.nome}`;
            fotoDiv.appendChild(img);
        } else {
            fotoDiv.textContent = 'Sem Foto da Base';
        }
        
        const nomeH4 = document.createElement('h4');
        nomeH4.textContent = org.nome;
        
        const infoP = document.createElement('p');
        infoP.textContent = org.info || '(Sem informações da base)';
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'dossier-org-actions';
        actionsDiv.innerHTML = `<button class="action-btn muted edit-org-btn" data-org-id="${org.id}">✏️ Editar Base</button>`;
        
        card.appendChild(fotoDiv);
        card.appendChild(nomeH4);
        card.appendChild(infoP);
        card.appendChild(actionsDiv);
        
        actionsDiv.querySelector('.edit-org-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openEditOrgModal(org.id);
        });
        
        card.addEventListener('click', () => {
            showDossierPeople(org.nome);
        });
        
        els.dossierOrgGrid.appendChild(card);
    });
};

const displayGlobalSearchResults = (orgs, people) => {
    els.dossierOrgGrid.innerHTML = ''; 
    
    if (orgs.length === 0 && people.length === 0) {
        els.dossierOrgGrid.innerHTML = '<p>Nenhuma organização ou pessoa encontrada para este filtro.</p>';
        return;
    }

    if (orgs.length > 0) {
        const orgsHeader = document.createElement('h3');
        orgsHeader.className = 'dossier-org-title';
        orgsHeader.textContent = 'Bases Encontradas';
        els.dossierOrgGrid.appendChild(orgsHeader);
        
        orgs.forEach(org => {
            const card = document.createElement('div');
            card.className = 'dossier-org-card';
            card.dataset.orgName = org.nome;
            
            card.style.cursor = 'pointer'; 
            
            const fotoDiv = document.createElement('div');
            fotoDiv.className = 'dossier-org-foto';
            if (org.fotoUrl) {
                const img = document.createElement('img');
                img.src = org.fotoUrl;
                img.alt = `Base de ${org.nome}`;
                fotoDiv.appendChild(img);
            } else {
                fotoDiv.textContent = 'Sem Foto da Base';
            }
            
            const nomeH4 = document.createElement('h4');
            nomeH4.textContent = org.nome;
            
            const infoP = document.createElement('p');
            infoP.textContent = org.info || '(Sem informações da base)';
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'dossier-org-actions';
            actionsDiv.innerHTML = `<button class="action-btn muted edit-org-btn" data-org-id="${org.id}">✏️ Editar Base</button>`;
            
            card.appendChild(fotoDiv);
            card.appendChild(nomeH4);
            card.appendChild(infoP);
            card.appendChild(actionsDiv);
            
            actionsDiv.querySelector('.edit-org-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openEditOrgModal(org.id);
            });
            card.addEventListener('click', () => {
                showDossierPeople(org.nome);
            });
            
            els.dossierOrgGrid.appendChild(card);
        });
    }

    if (people.length > 0) {
        const peopleHeader = document.createElement('h3');
        peopleHeader.className = 'dossier-org-title';
        peopleHeader.textContent = 'Pessoas Encontradas';
        els.dossierOrgGrid.appendChild(peopleHeader);
        
        people.forEach(entry => {
            
            const card = document.createElement('div');
            card.className = 'dossier-entry-card';
            card.dataset.id = entry.id; 
            card.style.cursor = 'default'; 
            
            const baseLink = document.createElement('a'); 
            baseLink.href = '#';
            baseLink.textContent = `Base: ${entry.org}`;
            baseLink.style.color = 'var(--cor-principal)'; 
            baseLink.style.fontSize = '14px';          
            baseLink.style.textAlign = 'left';       
            baseLink.style.margin = '0 0 8px 0';       
            baseLink.style.fontWeight = '600';
            baseLink.style.borderBottom = '1px solid var(--cor-borda)'; 
            baseLink.style.paddingBottom = '5px';
            baseLink.style.display = 'block'; 
            baseLink.style.textDecoration = 'none'; 
            baseLink.style.cursor = 'pointer'; 
            
            baseLink.addEventListener('click', (e) => {
                e.preventDefault(); 
                e.stopPropagation(); 
                showDossierPeople(entry.org);
            });
            
            card.appendChild(baseLink); 

            const fotoDiv = document.createElement('div');
            fotoDiv.className = 'dossier-foto';
            if (entry.fotoUrl) {
                const img = document.createElement('img');
                img.src = entry.fotoUrl;
                img.alt = `Foto de ${entry.nome}`;
                fotoDiv.appendChild(img);
            } else {
                fotoDiv.textContent = 'Sem Foto';
            }
            
            const nomeH4 = document.createElement('h4');
            nomeH4.textContent = entry.nome || '(Sem Nome)';
            
            const numeroP = document.createElement('p');
            numeroP.textContent = entry.numero || '(Sem Número)';

            const cargoP = document.createElement('p');
            cargoP.innerHTML = `<strong>Cargo:</strong> ${entry.cargo || 'N/A'}`;
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'dossier-actions';
            actionsDiv.innerHTML = `
                <button class="action-btn muted edit-dossier-btn" data-org="${entry.org}" data-id="${entry.id}">✏️ Editar</button>
                <button class="action-btn danger delete-dossier-btn" data-org="${entry.org}" data-id="${entry.id}">❌ Apagar</button>
            `;
            
            card.appendChild(fotoDiv);
            card.appendChild(nomeH4);
            card.appendChild(numeroP);
            card.appendChild(cargoP);
            
            if (entry.instagram) {
                const instagramP = document.createElement('p');
                let instaHandle = entry.instagram.startsWith('@') ? entry.instagram.substring(1) : entry.instagram;
                instaHandle = instaHandle.split('/')[0]; 
                instagramP.innerHTML = `<strong>Instagram:</strong> <span style="color: var(--cor-principal); font-weight: 500;">@${instaHandle}</span>`;
                instagramP.style.fontSize = '13px';
                card.appendChild(instagramP);
            }
            
            const veiculos = entry.veiculos || {};
            const veiculosCount = Object.keys(veiculos).length;

            if (veiculosCount > 0) {
                const details = document.createElement('details');
                details.style.marginTop = '5px';
                const summary = document.createElement('summary');
                summary.innerHTML = `<strong>Veículos (${veiculosCount})</strong> (Clique para ver)`;
                summary.style.cursor = 'pointer';
                summary.style.fontWeight = '600';
                summary.style.color = 'var(--cor-principal)';
                summary.style.fontSize = '13px';
                details.appendChild(summary);
                for (const id in veiculos) {
                    const veiculo = veiculos[id];
                    const p = document.createElement('p');
                    let fotoLink = '';
                    if (veiculo.fotoUrl) {
                        fotoLink = ` <a href="#" class="veiculo-foto-link" data-url="${veiculo.fotoUrl}" style="font-size: 11px; color: var(--cor-principal); text-decoration: none; font-weight: 600;">[Ver Foto]</a>`;
                    } else {
                        fotoLink = ` <span style="font-size: 11px; color: #888; font-weight: normal;">[Sem Foto]</span>`;
                    }
                    p.innerHTML = `<strong>${veiculo.carro || 'N/A'}:</strong> ${veiculo.placa || 'N/A'}${fotoLink}`;
                    p.style.fontWeight = 'normal';
                    p.style.color = 'var(--cor-texto)';
                    p.style.marginTop = '5px';
                    p.style.textAlign = 'left';
                    details.appendChild(p);
                }
                card.appendChild(details);
            } else {
                const p = document.createElement('p');
                p.innerHTML = '<strong>Veículos:</strong> N/A';
                p.style.fontWeight = 'normal';
                p.style.color = 'var(--cor-texto)';
                card.appendChild(p);
            }
            
            card.appendChild(actionsDiv);
            els.dossierOrgGrid.appendChild(card);
        });
        
        if (orgSortableInstance) {
            orgSortableInstance.destroy();
            orgSortableInstance = null;
        }
    }
};

const filterOrgs = async () => {
    const query = els.filtroDossierOrgs.value.toLowerCase().trim();
    
    if (!query) {
        displayOrgs(globalAllOrgs); 
        initOrgSortable(); 
        return;
    }
    
    els.dossierOrgGrid.innerHTML = '<p>Buscando...</p>'; 
    
    const filteredOrgs = globalAllOrgs.filter(org => 
        org.nome.toLowerCase().includes(query)
    );
    
    const filteredPeople = await searchAllPeopleGlobal(query);
    
    displayGlobalSearchResults(filteredOrgs, filteredPeople);
    
    if (orgSortableInstance) {
        orgSortableInstance.destroy();
        orgSortableInstance = null;
    }
};

const showDossierPeople = async (orgName) => {
    els.dossierOrgContainer.style.display = 'none';
    els.dossierPeopleContainer.style.display = 'block';
    els.dossierPeopleTitle.textContent = `Membros: ${orgName}`;
    els.dossierPeopleGrid.innerHTML = '<p>Carregando membros...</p>';
    
    els.addPessoaBtn.dataset.orgName = orgName;
    
    globalCurrentPeople = [];
    
    if (orgSortableInstance) {
        orgSortableInstance.destroy();
        orgSortableInstance = null;
    }
    
    try {
        const peopleRef = ref(db, `dossies/${orgName}`);
        const snapshot = await get(peopleRef);
        
        if (!snapshot.exists()) {
            els.dossierPeopleGrid.innerHTML = '<p>Nenhum membro registrado para esta organização.</p>';
            initSortable(orgName); 
            return;
        }
        
        const peopleData = snapshot.val();
        for (const personId in peopleData) {
            globalCurrentPeople.push({
                id: personId,
                org: orgName,
                ...peopleData[personId]
            });
        }
        
        globalCurrentPeople.sort((a, b) => {
            const indexA = a.hierarquiaIndex !== undefined ? a.hierarquiaIndex : Infinity;
            const indexB = b.hierarquiaIndex !== undefined ? b.hierarquiaIndex : Infinity;
            if (indexA !== indexB) {
                return indexA - indexB; 
            }
            return (a.nome || '').localeCompare(b.nome || ''); 
        });
        
        displayPeople(globalCurrentPeople);
        
        initSortable(orgName); 
        
    } catch (error) {
        els.dossierPeopleGrid.innerHTML = `<p style="color: var(--cor-erro);">Erro ao carregar membros: ${error.message}</p>`;
    }
};

const displayPeople = (people) => {
    els.dossierPeopleGrid.innerHTML = '';
    if (people.length === 0) {
        els.dossierPeopleGrid.innerHTML = '<p>Nenhum membro encontrado para este filtro.</p>';
        return;
    }

    people.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'dossier-entry-card';
        card.dataset.id = entry.id; 
        
        const fotoDiv = document.createElement('div');
        fotoDiv.className = 'dossier-foto';
        if (entry.fotoUrl) {
            const img = document.createElement('img');
            img.src = entry.fotoUrl;
            img.alt = `Foto de ${entry.nome}`;
            fotoDiv.appendChild(img);
        } else {
            fotoDiv.textContent = 'Sem Foto';
        }
        
        const nomeH4 = document.createElement('h4');
        nomeH4.textContent = entry.nome || '(Sem Nome)';
        
        const numeroP = document.createElement('p');
        numeroP.textContent = entry.numero || '(Sem Número)';

        const cargoP = document.createElement('p');
        cargoP.innerHTML = `<strong>Cargo:</strong> ${entry.cargo || 'N/A'}`;
        
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'dossier-actions';
        actionsDiv.innerHTML = `
            <button class="action-btn muted edit-dossier-btn" data-org="${entry.org}" data-id="${entry.id}">✏️ Editar</button>
            <button class="action-btn danger delete-dossier-btn" data-org="${entry.org}" data-id="${entry.id}">❌ Apagar</button>
        `;
        
        card.appendChild(fotoDiv);
        card.appendChild(nomeH4);
        card.appendChild(numeroP);
        card.appendChild(cargoP);
        
        if (entry.instagram) {
            const instagramP = document.createElement('p');
            let instaHandle = entry.instagram.startsWith('@') ? entry.instagram.substring(1) : entry.instagram;
            instaHandle = instaHandle.split('/')[0]; 
            
            instagramP.innerHTML = `<strong>Instagram:</strong> <span style="color: var(--cor-principal); font-weight: 500;">@${instaHandle}</span>`;
            
            instagramP.style.fontSize = '13px';
            card.appendChild(instagramP);
        }
        
        const veiculos = entry.veiculos || {};
        const veiculosCount = Object.keys(veiculos).length;

        if (veiculosCount > 0) {
            const details = document.createElement('details');
            details.style.marginTop = '5px';
            
            const summary = document.createElement('summary');
            summary.innerHTML = `<strong>Veículos (${veiculosCount})</strong> (Clique para ver)`;
            summary.style.cursor = 'pointer';
            summary.style.fontWeight = '600';
            summary.style.color = 'var(--cor-principal)';
            summary.style.fontSize = '13px';
            
            details.appendChild(summary);
            
            for (const id in veiculos) {
                const veiculo = veiculos[id];
                const p = document.createElement('p');
                
                let fotoLink = '';
                if (veiculo.fotoUrl) {
                    fotoLink = ` <a href="#" class="veiculo-foto-link" data-url="${veiculo.fotoUrl}" style="font-size: 11px; color: var(--cor-principal); text-decoration: none; font-weight: 600;">[Ver Foto]</a>`;
                } else {
                    fotoLink = ` <span style="font-size: 11px; color: #888; font-weight: normal;">[Sem Foto]</span>`;
                }
                
                p.innerHTML = `<strong>${veiculo.carro || 'N/A'}:</strong> ${veiculo.placa || 'N/A'}${fotoLink}`;
                p.style.fontWeight = 'normal';
                p.style.color = 'var(--cor-texto)';
                p.style.marginTop = '5px';
                p.style.textAlign = 'left';
                details.appendChild(p);
            }
            card.appendChild(details);
        } else {
            const p = document.createElement('p');
            p.innerHTML = '<strong>Veículos:</strong> N/A';
            p.style.fontWeight = 'normal';
            p.style.color = 'var(--cor-texto)';
            card.appendChild(p);
        }
        
        card.appendChild(actionsDiv); 
        
        els.dossierPeopleGrid.appendChild(card);
    });
};

const filterPeople = () => {
    const query = els.filtroDossierPeople.value.toLowerCase().trim();
    if (!query) {
        displayPeople(globalCurrentPeople);
        return;
    }
    
    const filteredPeople = globalCurrentPeople.filter(entry => {
        const nome = entry.nome ? entry.nome.toLowerCase() : '';
        const cargo = entry.cargo ? entry.cargo.toLowerCase() : '';
        const instagram = entry.instagram ? entry.instagram.toLowerCase() : ''; 
        
        let veiculoMatch = false;
        if (entry.veiculos) {
            for (const id in entry.veiculos) {
                const v = entry.veiculos[id];
                if ((v.carro && v.carro.toLowerCase().includes(query)) || (v.placa && v.placa.toLowerCase().includes(query))) {
                    veiculoMatch = true;
                    break;
                }
            }
        }
        
        return nome.includes(query) || cargo.includes(query) || instagram.includes(query) || veiculoMatch; 
    });
    
    displayPeople(filteredPeople);
};

const openAddOrgModal = () => {
    els.orgModalTitle.textContent = "Adicionar Nova Base";
    els.editOrgId.value = '';
    els.orgNome.value = '';
    els.orgNome.disabled = false;
    els.orgFotoUrl.value = '';
    els.orgInfo.value = '';
    els.deleteOrgBtn.style.display = 'none';
    
    document.querySelectorAll('.input-invalido').forEach(el => el.classList.remove('input-invalido'));
    
    els.orgModalOverlay.style.display = 'block';
    els.orgModal.style.display = 'block';
    els.orgNome.focus();
};

const openEditOrgModal = (orgId) => {
    const org = globalAllOrgs.find(o => o.id === orgId);
    if (!org) {
        showToast("Erro: Organização não encontrada.", "error");
        return;
    }
    
    els.orgModalTitle.textContent = "Editar Base";
    els.editOrgId.value = org.id;
    els.orgNome.value = org.nome;
    els.orgNome.disabled = true;
    els.orgFotoUrl.value = org.fotoUrl || '';
    els.orgInfo.value = org.info || '';
    els.deleteOrgBtn.style.display = 'inline-block';
    
    document.querySelectorAll('.input-invalido').forEach(el => el.classList.remove('input-invalido'));

    els.orgModalOverlay.style.display = 'block';
    els.orgModal.style.display = 'block';
    els.orgFotoUrl.focus();
};

const closeOrgModal = () => {
    els.orgModalOverlay.style.display = 'none';
    els.orgModal.style.display = 'none';
};

const saveOrg = async () => {
    const orgNome = capitalizeText(els.orgNome.value.trim());
    const orgId = els.editOrgId.value || orgNome;
    
    if (!orgId) {
        showToast("O Nome da Organização é obrigatório.", "error");
        els.orgNome.classList.add('input-invalido');
        return;
    }
    els.orgNome.classList.remove('input-invalido');
    
    const orgRef = ref(db, `organizacoes/${orgId}`);
    
    let existingIndex = 9999;
    if (els.editOrgId.value) {
        try {
            const snapshot = await get(orgRef);
            if (snapshot.exists()) {
                existingIndex = snapshot.val().ordemIndex !== undefined ? snapshot.val().ordemIndex : 9999;
            }
        } catch (e) {
            console.error("Erro ao buscar ordemIndex:", e);
        }
    } 

    const orgData = {
        nome: orgNome,
        fotoUrl: els.orgFotoUrl.value.trim(),
        info: els.orgInfo.value.trim(),
        ordemIndex: existingIndex 
    };
    
    set(orgRef, orgData)
        .then(() => {
            showToast("Base salva com sucesso!", "success");
            closeOrgModal();
            showDossierOrgs();
        })
        .catch(err => showToast(`Erro ao salvar: ${err.message}`, "error"));
};

const deleteOrg = () => {
    const orgId = els.editOrgId.value;
    if (!orgId) return;
    
    if (confirm(`ATENÇÃO:\n\nIsso apagará as INFORMAÇÕES DA BASE "${orgId}".\n\NIsso NÃO apagará os membros (pessoas) que estão dentro dela.\n\nDeseja continuar?`)) {
        remove(ref(db, `organizacoes/${orgId}`))
            .then(() => {
                showToast("Informações da base removidas.", "success");
                closeOrgModal();
                showDossierOrgs();
            })
            .catch(err => showToast(`Erro: ${err.message}`, "error"));
    }
};

const renderModalVeiculos = (listaElement) => {
    listaElement.innerHTML = ''; 
    if (Object.keys(tempVeiculos).length === 0) {
        listaElement.innerHTML = '<p style="font-size: 13px; text-align: center; margin: 0; padding: 5px;">Nenhum veículo adicionado.</p>';
        return;
    }
    
    for (const key in tempVeiculos) {
        const veiculo = tempVeiculos[key];
        const itemDiv = document.createElement('div');
        itemDiv.className = 'veiculo-item-modal';
        itemDiv.innerHTML = `
            <span style="flex-grow: 1;"><strong>${veiculo.carro || 'N/A'}:</strong> ${veiculo.placa || 'N/A'}</span>
            <button class="muted action-btn edit-veiculo-btn" data-key="${key}">Editar</button>
            <button class="danger action-btn remove-veiculo-btn" data-key="${key}">Remover</button>
        `;
        listaElement.appendChild(itemDiv);
    }
};

const iniciarEdicaoVeiculo = (key, modalPrefix) => {
    if (!tempVeiculos[key]) return;
    
    const veiculo = tempVeiculos[key];
    veiculoEmEdicaoKey = key; 
    
    els[modalPrefix + 'CarroNome'].value = veiculo.carro;
    els[modalPrefix + 'CarroPlaca'].value = veiculo.placa;
    els[modalPrefix + 'CarroFoto'].value = veiculo.fotoUrl;
    
    els[modalPrefix + 'AddVeiculoBtn'].textContent = 'Atualizar Veículo';
    els[modalPrefix + 'CancelVeiculoBtn'].style.display = 'inline-block';
    
    els[modalPrefix + 'CarroNome'].focus();
};

const cancelarEdicaoVeiculo = (modalPrefix) => {
    veiculoEmEdicaoKey = null; 
    
    els[modalPrefix + 'CarroNome'].value = '';
    els[modalPrefix + 'CarroPlaca'].value = '';
    els[modalPrefix + 'CarroFoto'].value = '';
    
    els[modalPrefix + 'AddVeiculoBtn'].textContent = '+ Adicionar Veículo';
    els[modalPrefix + 'CancelVeiculoBtn'].style.display = 'none';
};

const adicionarOuAtualizarVeiculoTemp = (modalPrefix) => {
    const carroEl = els[modalPrefix + 'CarroNome'];
    const placaEl = els[modalPrefix + 'CarroPlaca'];
    const fotoEl = els[modalPrefix + 'CarroFoto'];
    const listaEl = els[modalPrefix + 'ListaVeiculos'];

    const carro = carroEl.value.trim();
    const placa = placaEl.value.trim().toUpperCase();
    const fotoUrl = fotoEl.value.trim();
    
    if (!carro || !placa) {
        showToast("Preencha o nome do carro e a placa.", "error");
        return;
    }
    
    if (veiculoEmEdicaoKey) {
        if (tempVeiculos[veiculoEmEdicaoKey]) {
            tempVeiculos[veiculoEmEdicaoKey] = { carro, placa, fotoUrl };
        }
    } else {
        const tempKey = `temp_${Date.now()}`;
        tempVeiculos[tempKey] = { carro, placa, fotoUrl };
    }
    
    renderModalVeiculos(listaEl); 
    cancelarEdicaoVeiculo(modalPrefix); 
};

const removerVeiculoTemp = (key, listaEl) => {
    if (tempVeiculos[key]) {
        delete tempVeiculos[key];
        renderModalVeiculos(listaEl);
    }
};

const openAddDossierModal = (orgName) => {
    els.addDossierOrganizacao.value = orgName;
    els.addDossierNome.value = '';
    els.addDossierNumero.value = '';
    els.addDossierCargo.value = '';
    els.addDossierFotoUrl.value = '';
    
    tempVeiculos = {}; 
    cancelarEdicaoVeiculo('addModal'); 
    renderModalVeiculos(els.addModalListaVeiculos); 
    
    document.querySelectorAll('.input-invalido').forEach(el => el.classList.remove('input-invalido'));
    
    els.addDossierOverlay.style.display = 'block';
    els.addDossierModal.style.display = 'block';
    els.addDossierNome.focus();
};

const closeAddDossierModal = () => {
    els.addDossierOverlay.style.display = 'none';
    els.addDossierModal.style.display = 'none';
    cancelarEdicaoVeiculo('addModal'); 
};

const saveNewDossierEntry = () => {
    const org = els.addDossierOrganizacao.value.trim();
    if (!org) {
        showToast("Erro: Organização não definida.", "error");
        return;
    }
    
    const nome = els.addDossierNome.value.trim();
    if (!nome) {
        showToast("O Nome da pessoa é obrigatório.", "error");
        els.addDossierNome.classList.add('input-invalido');
        return;
    }
    els.addDossierNome.classList.remove('input-invalido');

    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');

    const newEntry = {
        organizacao: org,
        nome: nome,
        numero: els.addDossierNumero.value.trim(),
        cargo: els.addDossierCargo.value.trim(),
        fotoUrl: els.addDossierFotoUrl.value.trim(),
        instagram: "", 
        veiculos: tempVeiculos, 
        hierarquiaIndex: 9999, 
        data: `${dia}/${mes}/${ano} ${horas}:${minutos}`
    };
    
    push(ref(db, `dossies/${org}`), newEntry)
        .then(() => {
             showToast("Nova pessoa salva no dossiê!", "success");
             closeAddDossierModal();
             showDossierPeople(org);
        })
        .catch(err => showToast(`Erro ao salvar: ${err.message}`, "error"));
};

const openEditDossierModal = async (org, id) => {
    let entry = globalCurrentPeople.find(e => e.id === id && e.org === org);
    
    if (!entry) {
        try {
            const entryRef = ref(db, `dossies/${org}/${id}`);
            const snapshot = await get(entryRef);
            if (snapshot.exists()) {
                entry = { id: snapshot.key, org: org, ...snapshot.val() };
                globalCurrentPeople = [entry];
            } else {
                showToast("Erro: Entrada não encontrada no Banco de Dados.", "error");
                return;
            }
        } catch (e) {
            showToast(`Erro ao buscar dados da pessoa: ${e.message}`, "error");
            return;
        }
    }
    
    els.editDossierOrg.value = entry.org;
    els.editDossierId.value = entry.id;
    els.editDossierNome.value = entry.nome || '';
    els.editDossierNumero.value = entry.numero || '';
    els.editDossierCargo.value = entry.cargo || '';
    els.editDossierFotoUrl.value = entry.fotoUrl || '';
    els.editDossierInstagram.value = entry.instagram || ''; 
    
    tempVeiculos = { ...(entry.veiculos || {}) };
    cancelarEdicaoVeiculo('editModal'); 
    renderModalVeiculos(els.editModalListaVeiculos);
    
    els.editDossierOverlay.style.display = 'block';
    els.editDossierModal.style.display = 'block';
};

const closeEditDossierModal = () => {
    els.editDossierOverlay.style.display = 'none';
    els.editDossierModal.style.display = 'none';
    cancelarEdicaoVeiculo('editModal'); 
};

const saveDossierChanges = () => {
    const org = els.editDossierOrg.value;
    const id = els.editDossierId.value;
    
    if (!org || !id) {
        showToast("Erro: ID da entrada perdido.", "error");
        return;
    }
    
    const originalEntry = globalCurrentPeople.find(e => e.id === id && e.org === org);
    if (!originalEntry) {
        showToast("Erro: Entrada original não encontrada.", "error");
        return;
    }
    
    const updatedEntry = {
        ...originalEntry,
        nome: els.editDossierNome.value.trim(),
        numero: els.editDossierNumero.value.trim(),
        cargo: els.editDossierCargo.value.trim(),
        fotoUrl: els.editDossierFotoUrl.value.trim(),
        instagram: els.editDossierInstagram.value.trim(), 
        veiculos: tempVeiculos 
    };
    
    delete updatedEntry.id;
    delete updatedEntry.org;

    const entryRef = ref(db, `dossies/${org}/${id}`);
    set(entryRef, updatedEntry)
        .then(() => {
            showToast("Dossiê atualizado com sucesso!", "success");
            closeEditDossierModal();
            showDossierPeople(org);
        })
        .catch((error) => {
            showToast(`Erro ao salvar: ${error.message}`, "error");
        });
};

const removeDossierEntry = (orgName, entryId) => {
    const userTagUpper = currentUserData.tag.toUpperCase();
    if (!currentUserData || (userTagUpper !== 'ADMIN' && userTagUpper !== 'HELLS')) {
        showToast("Apenas Admin/Hells podem remover entradas.", "error");
        return;
    }
    
    if (confirm("Tem certeza que deseja remover esta PESSOA do dossiê?")) {
        const entryRef = ref(db, `dossies/${orgName}/${entryId}`);
        remove(entryRef)
            .then(() => {
                showToast("Pessoa removida do dossiê.", "success");
                showDossierPeople(orgName);
            })
            .catch((error) => {
                showToast(`Erro ao remover: ${error.message}`, "error");
            });
    }
};

const migrateVendasToDossier = async () => {
    if (!confirm("Isso irá copiar *todas* as vendas com organização para o Dossiê de Pessoas. (Já faz verificação de duplicados). Deseja continuar?")) {
        return;
    }
    
    showToast("Iniciando migração... Isso pode demorar.", "default", 5000);
    els.migrateDossierBtn.disabled = true;
    els.migrateDossierBtn.textContent = "Migrando...";
    
    try {
        const vendasRef = ref(db, 'vendas');
        const snapshot = await get(vendasRef);
        
        if (!snapshot.exists()) {
            showToast("Nenhuma venda encontrada para migrar.", "error");
            return;
        }
        
        const vendas = snapshot.val();
        let count = 0;
        
        for (const vendaId in vendas) {
            const venda = vendas[vendaId];
            
            const vendaData = {
                cliente: venda.cliente,
                organizacao: venda.organizacao,
                telefone: venda.telefone,
                vendaValorObs: venda.vendaValorObs || 'N/A (Migrado)',
                dataHora: venda.dataHora,
                carro: venda.carro,
                placas: venda.placas
            };

            await addDossierEntry(vendaData, null);
            count++;
        }
        
        showToast(`Migração concluída! ${count} registros verificados/migrados.`, "success");
        
    } catch (error) {
        showToast(`Erro na migração: ${error.message}`, "error");
    } finally {
        els.migrateDossierBtn.disabled = false;
        els.migrateDossierBtn.textContent = "Migrar Vendas Antigas para Dossiê";
    }
};

const migrateVeiculosData = async () => {
    if (!confirm("ATENÇÃO: Isso irá converter TODOS os campos 'carro' e 'placas' (com vírgulas) para o novo sistema de veículos. Faça isso APENAS UMA VEZ.\n\nDeseja continuar?")) {
        return;
    }
    
    showToast("Iniciando migração de veículos... Isso pode demorar.", "default", 5000);
    els.migrateVeiculosBtn.disabled = true;
    els.migrateVeiculosBtn.textContent = "Migrando...";
    
    try {
        const dossiesRef = ref(db, 'dossies');
        const snapshot = await get(dossiesRef);
        
        if (!snapshot.exists()) {
            showToast("Nenhum dossiê encontrado.", "error");
            return;
        }
        
        const dossies = snapshot.val();
        let count = 0;
        const updates = {};
        
        for (const org in dossies) {
            for (const personId in dossies[org]) {
                const person = dossies[org][personId];
                
                if ((person.carro || person.placas) && !person.veiculos) {
                    const newVeiculos = {};
                    const carros = person.carro ? person.carro.split(',').map(c => c.trim()) : [];
                    const placas = person.placas ? person.placas.split(',').map(p => p.trim()) : [];
                    
                    const maxLen = Math.max(carros.length, placas.length);
                    
                    for (let i = 0; i < maxLen; i++) {
                        const newKey = `mig_${i}`;
                        newVeiculos[newKey] = {
                            carro: carros[i] || 'N/A',
                            placa: placas[i] || 'N/A',
                            fotoUrl: '' 
                        };
                    }
                    
                    const path = `dossies/${org}/${personId}`;
                    updates[`${path}/veiculos`] = newVeiculos;
                    updates[`${path}/carro`] = null; 
                    updates[`${path}/placas`] = null; 
                    count++;
                }
            }
        }
        
        if (count > 0) {
            await update(ref(db), updates);
            showToast(`Migração de veículos concluída! ${count} registros atualizados.`, "success");
        } else {
            showToast("Nenhum registro antigo para migrar.", "default");
        }
        
    } catch (error) {
        showToast(`Erro na migração de veículos: ${error.message}`, "error");
    } finally {
        els.migrateVeiculosBtn.disabled = false;
        els.migrateVeiculosBtn.textContent = "Migrar Veículos Antigos (Dossiê)";
    }
};

const toggleTheme = () => {
    const isDarkMode = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateLogoAndThemeButton(isDarkMode);
};

const updateLogoAndThemeButton = (isDarkMode) => {
    els.themeBtn.textContent = isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Noturno';
    els.appLogo.src = isDarkMode ? logoDarkModeSrc : logoLightModeSrc;
    els.welcomeLogo.src = welcomeLogoSrc;
    els.historyImg.src = historyBackgroundSrc;
};

// ... (Restante do código de tutorial, listeners e inicialização)

els.calcBtn.onclick = calculate;
els.resetBtn.onclick = clearAllFields;
els.registerBtn.onclick = registerVenda;
els.toggleHistoryBtn.onclick = () => toggleView('history');
els.toggleCalcBtn.onclick = () => toggleView('main');
els.clearHistoryBtn.onclick = clearHistory;
els.csvBtn.onclick = exportToCsv;
els.themeBtn.onclick = toggleTheme;
//els.tutorialBtn.onclick = ...; // Removido para concisão, use sua implementação
els.discordBtnCalc.onclick = () => copyDiscordMessage(false, null);
els.filtroHistorico.addEventListener('input', filterHistory);

els.nomeCliente.addEventListener('change', autoFillFromDossier);

els.investigacaoBtn.onclick = () => toggleView('dossier');
els.toggleCalcBtnDossier.onclick = () => toggleView('main');

els.filtroDossierOrgs.addEventListener('input', filterOrgs);
els.addOrgBtn.onclick = openAddOrgModal;

els.dossierVoltarBtn.onclick = () => showDossierOrgs();
els.filtroDossierPeople.addEventListener('input', filterPeople);
els.addPessoaBtn.onclick = () => {
    const orgName = els.addPessoaBtn.dataset.orgName;
    if(orgName) { openAddDossierModal(orgName); }
};

els.dossierPeopleGrid.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-dossier-btn');
    const deleteBtn = e.target.closest('.delete-dossier-btn');
    const fotoLinkBtn = e.target.closest('.veiculo-foto-link'); 
    
    if (fotoLinkBtn) {
        e.preventDefault(); 
        const url = fotoLinkBtn.dataset.url;
        showImageLightbox(url);
    }
    
    if (deleteBtn) {
        const org = deleteBtn.dataset.org;
        const id = deleteBtn.dataset.id;
        removeDossierEntry(org, id);
    }
    if (editBtn) {
        const org = editBtn.dataset.org;
        const id = editBtn.dataset.id;
        openEditDossierModal(org, id);
    }
});

els.dossierOrgGrid.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-dossier-btn');
    const deleteBtn = e.target.closest('.delete-dossier-btn');
    const fotoLinkBtn = e.target.closest('.veiculo-foto-link');
    
    if (fotoLinkBtn) {
        e.preventDefault();
        const url = fotoLinkBtn.dataset.url;
        showImageLightbox(url);
    }
    
    if (deleteBtn) {
        const org = deleteBtn.dataset.org;
        const id = deleteBtn.dataset.id;
        removeDossierEntry(org, id);
    }
    if (editBtn) {
        const org = editBtn.dataset.org;
        const id = editBtn.dataset.id;
        openEditDossierModal(org, id);
    }
});

els.saveDossierBtn.onclick = saveDossierChanges;
els.cancelDossierBtn.onclick = closeEditDossierModal;
els.editDossierOverlay.onclick = closeEditDossierModal;

els.saveNewDossierBtn.onclick = saveNewDossierEntry;
els.cancelNewDossierBtn.onclick = closeAddDossierModal;
els.addDossierOverlay.onclick = closeAddDossierModal;

els.addModalAddVeiculoBtn.onclick = () => adicionarOuAtualizarVeiculoTemp('addModal');
els.editModalAddVeiculoBtn.onclick = () => adicionarOuAtualizarVeiculoTemp('editModal');

els.addModalCancelVeiculoBtn.onclick = () => cancelarEdicaoVeiculo('addModal');
els.editModalCancelVeiculoBtn.onclick = () => cancelarEdicaoVeiculo('editModal');

els.addModalListaVeiculos.onclick = (e) => {
    const removeBtn = e.target.closest('.remove-veiculo-btn');
    const editBtn = e.target.closest('.edit-veiculo-btn');
    
    if (removeBtn) {
        removerVeiculoTemp(removeBtn.dataset.key, els.addModalListaVeiculos);
    }
    if (editBtn) {
        iniciarEdicaoVeiculo(editBtn.dataset.key, 'addModal');
    }
};
els.editModalListaVeiculos.onclick = (e) => {
    const removeBtn = e.target.closest('.remove-veiculo-btn');
    const editBtn = e.target.closest('.edit-veiculo-btn');
    
    if (removeBtn) {
        removerVeiculoTemp(removeBtn.dataset.key, els.editModalListaVeiculos);
    }
    if (editBtn) {
        iniciarEdicaoVeiculo(editBtn.dataset.key, 'editModal');
    }
};

els.saveOrgBtn.onclick = saveOrg;
els.deleteOrgBtn.onclick = deleteOrg;
els.cancelOrgBtn.onclick = closeOrgModal;
els.orgModalOverlay.onclick = closeOrgModal;

els.imageLightboxOverlay.onclick = closeImageLightbox;

els.migrateDossierBtn.onclick = migrateVendasToDossier;
els.migrateVeiculosBtn.onclick = migrateVeiculosData; 
els.toggleCalcBtnAdmin.onclick = () => toggleView('main'); 

els.saveBottomPanelTextBtn.onclick = () => {
    const newText = els.bottomPanelText.value.trim();
    updateGlobalLayout('bottomPanelText', newText);
    showToast("Mensagem do rodapé salva!", "success");
};

const deleteUser = (uid, displayName) => {
    if (confirm(`ATENÇÃO:\n\nTem certeza que deseja apagar o usuário "${displayName}"?\n\nIsso removerá o registro dele do banco de dados (e suas permissões).\n\nIMPORTANTE: Para apagar o LOGIN dele permanentemente, você ainda precisará ir ao painel "Authentication" do Firebase.`)) {
        
        const userRef = ref(db, `usuarios/${uid}`);
        remove(userRef)
            .then(() => {
                showToast(`Usuário "${displayName}" apagado do banco de dados.`, 'success');
                loadAdminPanel();
            })
            .catch((error) => {
                showToast(`Erro ao apagar usuário: ${error.message}`, 'error');
            });
    }
};

const loadAdminPanel = async () => {
    els.adminUserListBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Carregando...</td></tr>';
    
    try {
        const usersSnapshot = await get(ref(db, 'usuarios'));
        if (!usersSnapshot.exists()) {
            els.adminUserListBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhum usuário encontrado.</td></tr>';
            return;
        }
        
        const usersList = [];
        usersSnapshot.forEach(userSnap => {
            const userData = userSnap.val();
            if (userData.displayName && userData.displayName.toLowerCase() === 'snow') {
                return;
            }
            usersList.push({ uid: userSnap.key, ...userData });
        });

        const tagOrder = { 'ADMIN': 1, 'HELLS': 2, 'Visitante': 3 };
        usersList.sort((a, b) => {
            const tagA = (tagOrder[a.tag.toUpperCase()] || 4);
            const tagB = (tagOrder[b.tag.toUpperCase()] || 4);
            if (tagA !== tagB) {
                return tagA - tagB;
            }
            return (a.displayName || '').localeCompare(b.displayName || '');
        });

        els.adminUserListBody.innerHTML = '';
        
        usersList.forEach(user => {
            const uid = user.uid;
            const userData = user;
            
            const row = els.adminUserListBody.insertRow();
            row.insertCell().textContent = userData.displayName || '(Sem nome)';
            
            const tagCell = row.insertCell();
            
            if (uid === currentUser.uid) {
                tagCell.textContent = `👑 ${userData.tag} (Você)`;
            } else {
                const select = document.createElement('select');
                select.style.width = '100%';
                select.dataset.uid = uid; 
                
                const optVisitante = document.createElement('option');
                optVisitante.value = 'Visitante';
                optVisitante.textContent = 'Visitante';
                select.appendChild(optVisitante);
                
                const optHells = document.createElement('option');
                optHells.value = 'HELLS';
                optHells.textContent = 'Hells';
                select.appendChild(optHells);
                
                const optAdmin = document.createElement('option');
                optAdmin.value = 'ADMIN';
                optAdmin.textContent = '👑 Administrador';
                select.appendChild(optAdmin);
                
                select.value = userData.tag.toUpperCase() === 'HELLS' ? 'HELLS' : (userData.tag.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'Visitante');
                select.onchange = (e) => updateUserTag(e.target.dataset.uid, e.target.value);
                tagCell.appendChild(select);
            }
            
            const actionsCell = row.insertCell();
            actionsCell.style.textAlign = 'center';
            actionsCell.style.verticalAlign = 'middle';

            if (uid === currentUser.uid) {
                actionsCell.textContent = '---';
            } else {
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '❌';
                deleteBtn.className = 'danger action-btn'; 
                deleteBtn.style.padding = '5px 8px';
                deleteBtn.style.fontSize = '14px';
                deleteBtn.style.lineHeight = '1';
                
                deleteBtn.addEventListener('click', () => {
                    deleteUser(uid, userData.displayName);
                });
                
                actionsCell.appendChild(deleteBtn);
            }
        });
        
    } catch (error) {
        showToast(`Erro ao carregar usuários: ${error.message}`, 'error');
        els.adminUserListBody.innerHTML = `<tr><td colspan="3" style="text-align: center;">Erro ao carregar. ${error.message}</td></tr>`;
    }
    
    try {
        const layoutSnapshot = await get(ref(db, 'configuracoesGlobais/layout'));
        if (layoutSnapshot.exists()) {
            const settings = layoutSnapshot.val();
            els.layoutToggleNightMode.checked = settings.enableNightMode;
            els.layoutToggleBottomPanel.checked = settings.enableBottomPanel;
            els.bottomPanelText.value = settings.bottomPanelText || '';
        }
    } catch (error) {
        if(error.code !== "PERMISSION_DENIED") {
            showToast(`Erro ao carregar configurações de layout: ${error.message}`, 'error');
        }
    }
};

const updateUserTag = (uid, newTag) => {
    const tagRef = ref(db, `usuarios/${uid}/tag`);
    set(tagRef, newTag)
        .then(() => {
            showToast("Permissão do usuário atualizada!", 'success');
        })
        .catch((error) => {
            showToast(`Erro ao atualizar tag: ${error.message}`, 'error');
        });
};

const updateGlobalLayout = (key, value) => {
    const layoutRef = ref(db, `configuracoesGlobais/layout/${key}`);
    set(layoutRef, value)
        .catch((error) => {
            showToast(`Erro ao salvar configuração: ${error.message}`, 'error');
        });
};

els.adminPanelBtn.onclick = () => toggleView('admin');
els.layoutToggleNightMode.onchange = (e) => updateGlobalLayout('enableNightMode', e.target.checked);
els.layoutToggleBottomPanel.onchange = (e) => updateGlobalLayout('enableBottomPanel', e.target.checked);


const handleAuthAction = (isLogin, creds) => {
    const email = creds.username.trim() + "@ha.com";
    const password = creds.password;
    const displayName = creds.username.trim();

    if ((isLogin && (!email || password.length < 6)) || (!isLogin && (!displayName || password.length < 6))) {
        showToast("Verifique os campos. A senha precisa ter no mínimo 6 caracteres.", "error");
        return;
    }

    if (isLogin) {
        signInWithEmailAndPassword(auth, email, password)
            .catch((error) => {
                const code = error.code;
                const msg = code === 'auth/invalid-credential' ? "Usuário ou senha incorretos." : `Erro: ${code}`;
                showToast(msg, "error");
            });
    } else {
        createUserWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                const user = userCredential.user;
                return updateProfile(user, { displayName: displayName })
                    .then(() => {
                        const userRef = ref(db, `usuarios/${user.uid}`);
                        const newUserProfile = { 
                            displayName: displayName,
                            email: user.email,
                            tag: 'Visitante'
                        };
                        return set(userRef, newUserProfile); 
                    });
            })
            .catch((error) => {
                const code = error.code;
                const msg = code === 'auth/email-already-in-use' ? "Nome de usuário já existe." : `Erro: ${code}`;
                showToast(msg, "error");
            });
    }
};

const authAction = (isLogin) => handleAuthAction(isLogin, {username: els.username.value, password: els.password.value});

els.loginBtn.onclick = () => authAction(true);
els.registerUserBtn.onclick = () => authAction(false);
els.logoutBtn.onclick = () => signOut(auth);
els.password.addEventListener('keydown', (e) => { if(e.key === 'Enter') authAction(true); });

els.forgotPasswordLink.onclick = async () => {
    const username = prompt("Digite seu nome de usuário para solicitar a redefinição de senha:");
    if (!username) return;

    const usersRef = ref(db, 'usuarios');
    const snapshot = await get(usersRef);
    let userEmail = null;
    if(snapshot.exists()) {
        snapshot.forEach(child => {
            const userData = child.val();
            if(userData.displayName.toLowerCase() === username.toLowerCase().trim()) {
                userEmail = userData.email;
            }
        });
    }

    if (userEmail) {
        sendPasswordResetEmail(auth, userEmail)
            .then(() => {
                alert("Um e-mail de redefinição de senha foi enviado para o endereço associado a este usuário.");
                showToast("E-mail de redefinição enviado!", "success");
            })
            .catch(err => showToast(`Erro: ${err.message}`, "error"));
    } else {
        showToast("Nome de usuário não encontrado.", "error");
    }
};

const configurarInterfacePorTag = (tag) => {
  const tagUpper = tag ? tag.toUpperCase() : 'VISITANTE';
  
  const userStatusEl = els.userStatus;
  if (currentUser && userStatusEl) {
      
      if (currentUser.displayName.toLowerCase() === 'snow') {
          userStatusEl.style.display = 'none';
      } else {
          userStatusEl.textContent = `${currentUser.displayName} (${tag})`;
          userStatusEl.className = 'user-status-display';
          if (tagUpper === 'ADMIN') {
              userStatusEl.classList.add('tag-admin');
          } else if (tagUpper === 'HELLS') {
              userStatusEl.classList.add('tag-hells');
          } else {
              userStatusEl.classList.add('tag-visitante');
          }
          userStatusEl.style.display = 'block';
      }
  }

  if (tagUpper === 'ADMIN') {
    els.clearHistoryBtn.style.display = 'inline-block';
    els.adminPanelBtn.style.display = 'inline-block';
  } else {
    els.clearHistoryBtn.style.display = 'none';
    els.adminPanelBtn.style.display = 'none';
  }
  
  if (tagUpper === 'ADMIN' || tagUpper === 'HELLS') {
      els.investigacaoBtn.style.display = 'block';
  } else {
      els.investigacaoBtn.style.display = 'none';
  }
  
  if (tagUpper !== 'ADMIN') {
      els.adminPanel.style.display = 'none';
  }
};


let vendasListener = null; 

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user; 
        const userRef = ref(db, `usuarios/${user.uid}`);
        
        updateUserActivity(); 
        
        onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                currentUserData = snapshot.val(); 
            } else {
                const newUserProfile = {
                    displayName: user.displayName, 
                    email: user.email,
                    tag: 'Visitante' 
                };
                set(userRef, newUserProfile);
                currentUserData = newUserProfile; 
            }
            
            configurarInterfacePorTag(currentUserData.tag);
             
            if(vendasListener) vendasListener(); 
            
            let vendasRef;
            const userTagUpper = currentUserData.tag.toUpperCase();
            
            if (userTagUpper === 'ADMIN' || userTagUpper === 'HELLS') {
                vendasRef = ref(db, 'vendas');
            } else {
                vendasRef = query(ref(db, 'vendas'), orderByChild('registradoPorId'), equalTo(currentUser.uid));
            }

            vendasListener = onValue(vendasRef, (vendasSnapshot) => {
                vendas = [];
                vendasSnapshot.forEach((child) => {
                    vendas.push({ id: child.key, ...child.val() });
                });
                if (els.historyCard.style.display !== 'none') {
                    displaySalesHistory(vendas);
                }
            }, (error) => {
                console.error("Erro ao carregar vendas: ", error);
                if(error.code !== "PERMISSION_DENIED") {
                    showToast("Erro de permissão ao carregar histórico.", "error");
                }
            });
        }, (error) => {
            console.error("Erro ao ler dados do usuário:", error);
            showToast("Erro fatal ao ler permissões do usuário.", "error");
            configurarInterfacePorTag('Visitante'); 
        });

        els.authScreen.style.display = 'none';
        toggleView('main');

    } else {
        currentUser = null;
        currentUserData = null;
        vendaOriginalCliente = null; 
        vendaOriginalOrganizacao = null; 
        if (vendasListener) vendasListener(); 
        vendas = []; 
        
        els.authScreen.style.display = 'block';
        els.mainCard.style.display = 'none';
        els.historyCard.style.display = 'none';
        els.adminPanel.style.display = 'none'; 
        els.dossierCard.style.display = 'none';
        if(els.userStatus) els.userStatus.style.display = 'none';
        if(els.investigacaoBtn) els.investigacaoBtn.style.display = 'none';
    }
});

const savedTheme = localStorage.getItem('theme') || 'light';
if(savedTheme === 'dark') {
    document.body.classList.add('dark');
}
updateLogoAndThemeButton(savedTheme === 'dark');

if (localStorage.getItem('hasVisited')) {
    els.welcomeScreen.style.display = 'none';
} else {
    els.welcomeScreen.classList.add('show');
    els.authScreen.style.display = 'none';
    els.mainCard.style.display = 'none';
}

els.enterBtn.onclick = () => {
    localStorage.setItem('hasVisited', 'true');
    els.welcomeScreen.classList.add('hidden');
    setTimeout(() => {
        els.welcomeScreen.style.display = 'none';
    }, 500);
};

// --- TODO: Adicionar lógica do Tutorial, que foi omitida para concisão ---