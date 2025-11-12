const tela = document.getElementById('game');
const ctx = tela.getContext('2d');
const menuPrincipal = document.getElementById('menu');
const btnIniciar = document.getElementById('startbtn');
const btnVoltar = document.getElementById('returnbtn');

if (confirm('Deseja jogar em tela cheia?')) {
  tela.width = window.innerWidth;
  tela.height = window.innerHeight;
  tela.style.position = 'fixed';
  tela.style.top = '0';
  tela.style.left = '0';
  tela.style.width = '100vw';
  tela.style.height = '100vh';
} else {
  tela.width = 800;
  tela.height = 600;
  tela.style.display = 'block';
  tela.style.margin = '20px auto';
  tela.style.border = '3px solid #000';
}


let velocidadeQuedaFlores = 80;      
let velocidadeQuedaAranhas = 150;   
let freqGeracaoAranhas = 5;         


let floresPegas = 0,
  meta = 5,
  tempoRestante = 30,
  vidas = 3,
  emJogo = false;

let quadrosAbelha = [],
  quadrosAranha = [],
  imagensFlores = [],
  imagemFundo = new Image();

let carregadas = 0,
  imgOverlay = null,
  posYfundo = 0,
  velFundo = 120;

function carregarImagem(src, arr) {
  const img = new Image();
  img.src = src;
  img.onload = () => carregadas++;
  arr.push(img);
}

['bee1', 'bee2', 'bee3', 'bee4'].forEach(n => carregarImagem(`img/${n}.png`, quadrosAbelha));
['spider1', 'spider2', 'spider3', 'spider4'].forEach(n => carregarImagem(`img/${n}.png`, quadrosAranha));
['flower1', 'flower2'].forEach(n => carregarImagem(`img/${n}.png`, imagensFlores));
imagemFundo.src = 'img/bg.png';
imagemFundo.onload = () => carregadas++;

class Entidade {
  constructor(x, y, w, h) { Object.assign(this, { x, y, largura: w, altura: h }); }
  desenhar(img, inv = false) {
    ctx.save();
    if (inv) {
      ctx.translate(this.x + this.largura, this.y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, this.largura, this.altura);
    } else ctx.drawImage(img, this.x, this.y, this.largura, this.altura);
    ctx.restore();
  }
  colide(o) {
    return this.x < o.x + o.largura &&
           this.x + this.largura > o.x &&
           this.y < o.y + o.altura &&
           this.y + this.altura > o.y;
  }
}

class Abelha extends Entidade {
  constructor() {
    super(tela.width / 2 - 32, tela.height - 80, 64, 48);
    this.direcao = 0;
    this.frame = 0;
    this.t = 0;
  }
  atualizar(dt) {
    this.x = Math.max(0, Math.min(this.x + this.direcao * 240 * dt, tela.width - this.largura));
    if ((this.t += dt) > 0.08) (this.frame = (this.frame + 1) % quadrosAbelha.length), (this.t = 0);
  }
  desenhar() {
    if (quadrosAbelha.length)
      ctx.drawImage(quadrosAbelha[this.frame], this.x, this.y, this.largura, this.altura);
  }
}

class Aranha extends Entidade {
  constructor() {
    const x = Math.random() * (tela.width - 64);
    const y = -Math.random() * 300 - 60;
    super(x, y, 64, 48);
    this.vel = velocidadeQuedaAranhas;
    this.frame = 0;
    this.t = 0;
  }
  atualizar(dt) {
    this.y += this.vel * dt;
    if ((this.t += dt) > 0.15)
      (this.frame = (this.frame + 1) % quadrosAranha.length), (this.t = 0);
    if (this.y > tela.height + 50) this.reiniciar();
  }
  reiniciar() {
    this.y = -Math.random() * 400 - 60;
    this.x = Math.random() * (tela.width - this.largura);
  }
  desenhar() {
    if (quadrosAranha.length)
      ctx.drawImage(quadrosAranha[this.frame], this.x, this.y, this.largura, this.altura);
  }
}

class Flor extends Entidade {
  constructor(x, y) {
    super(x, y, 36, 36);
    this.vel = velocidadeQuedaFlores;
    this.frame = 0;
    this.t = 0;
  }
  atualizar(dt) {
    this.y += this.vel * dt;
    if ((this.t += dt) > 0.25)
      (this.frame = (this.frame + 1) % imagensFlores.length), (this.t = 0);
    if (this.y > tela.height + 50) this.reiniciar();
  }
  reiniciar() {
    this.y = -Math.random() * 800 - 50;
    this.x = Math.random() * (tela.width - this.largura);
  }
  desenhar() {
    if (imagensFlores.length)
      ctx.drawImage(imagensFlores[this.frame], this.x, this.y, this.largura, this.altura);
  }
}

let abelha = new Abelha(),
  aranhas = [],
  flores = [];

function criarFlores(qtd) {
  flores = Array.from({ length: qtd }, () => {
    const x = Math.random() * (tela.width - 36);
    const y = -Math.random() * 800 - 50;
    return new Flor(x, y);
  });
}

function criarAranha() {
  aranhas.push(new Aranha());
}

addEventListener('keydown', e => {
  if (['a', 'ArrowLeft'].includes(e.key)) abelha.direcao = -1;
  if (['d', 'ArrowRight'].includes(e.key)) abelha.direcao = 1;
});
addEventListener('keyup', e => {
  if (['a', 'ArrowLeft'].includes(e.key) && abelha.direcao === -1) abelha.direcao = 0;
  if (['d', 'ArrowRight'].includes(e.key) && abelha.direcao === 1) abelha.direcao = 0;
});

function som(f, d) {
  try {
    const a = new (AudioContext || webkitAudioContext)(),
      o = a.createOscillator()
      g = a.createGain();
    o.connect(g); g.connect(a.destination);
    o.type = 'sine'; o.frequency.value = f; g.gain.value = 0.0001;
    o.start();
    g.gain.exponentialRampToValueAtTime(0.2, a.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + d);
    o.stop(a.currentTime + d + 0.02);
  } catch {}
}

const somColeta = () => som(1200, 0.12),
  somDano = () => som(220, 0.25),
  somGameOver = () => som(200, 0.7);

function desenharHUD() {
  ctx.font = '24px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;

  const x = 20, y = 20, esp = 30;
  ctx.strokeText(`Flores: ${floresPegas}/${meta}`, x, y);
  ctx.strokeText(`Tempo: ${Math.ceil(tempoRestante)}s`, x, y + esp);
  ctx.strokeText(`Vidas: ${vidas}`, x, y + esp * 2);
  ctx.fillText(`Flores: ${floresPegas}/${meta}`, x, y);
  ctx.fillText(`Tempo: ${Math.ceil(tempoRestante)}s`, x, y + esp);
  ctx.fillText(`Vidas: ${vidas}`, x, y + esp * 2);
}

function atualizar(dt) {
  if (!emJogo) return;
  abelha.atualizar(dt);
  aranhas.forEach(a => a.atualizar(dt));
  flores.forEach(f => f.atualizar(dt));

  aranhas.forEach(a => {
    if (abelha.colide(a)) {
      somDano();
      a.reiniciar();
      vidas--;
      if (vidas <= 0) return encerrar(false);
    }
  });

  flores.forEach(f => {
    if (abelha.colide(f)) {
      somColeta();
      floresPegas++;
      f.reiniciar();
      if (floresPegas >= meta) encerrar(true);
    }
  });
}

function desenharFundo() {
  if (!imagemFundo.complete) return;
  posYfundo = (posYfundo + velFundo / 60) % imagemFundo.height;
  ctx.drawImage(imagemFundo, 0, posYfundo, tela.width, imagemFundo.height);
  ctx.drawImage(imagemFundo, 0, posYfundo - imagemFundo.height, tela.width, imagemFundo.height);
}

function desenhar() {
  ctx.clearRect(0, 0, tela.width, tela.height);
  desenharFundo();
  abelha.desenhar();
  aranhas.forEach(a => a.desenhar());
  flores.forEach(f => f.desenhar());
  desenharHUD();
  if (imgOverlay)
    ctx.drawImage(imgOverlay, (tela.width - imgOverlay.width) / 2, (tela.height - imgOverlay.height) / 2);
}

let anterior = performance.now();
function ciclo(ts) {
  const dt = (ts - anterior) / 1000;
  anterior = ts;
  atualizar(dt);
  desenhar();
  requestAnimationFrame(ciclo);
}
requestAnimationFrame(ciclo);

let refTempo = null, refGeracao = null;

btnIniciar.addEventListener('click', () => {
  if (carregadas >= 11 && !emJogo) iniciar();
});
btnVoltar.addEventListener('click', () => {
  btnVoltar.style.display = 'none';
  menuPrincipal.style.display = 'flex';
  reiniciar();
});

function iniciar() {
  emJogo = true;
  imgOverlay = null;
  floresPegas = 0;
  vidas = 3;
  tempoRestante = 30;
  menuPrincipal.style.display = 'none';
  aranhas = [new Aranha()];
  criarFlores(6);

  clearInterval(refTempo);
  refTempo = setInterval(() => {
    if (!emJogo) return clearInterval(refTempo);
    tempoRestante--;
    if (tempoRestante <= 0) encerrar(floresPegas >= meta);
  }, 1000);

  clearInterval(refGeracao);
  refGeracao = setInterval(() => {
    if (emJogo) criarAranha();
  }, freqGeracaoAranhas * 1000);
}

function encerrar(vitoria) {
  emJogo = false;
  clearInterval(refTempo);
  clearInterval(refGeracao);
  imgOverlay = new Image();
  imgOverlay.src = vitoria ? 'img/youwin.png' : 'img/gameover.png';
  btnVoltar.style.display = 'block';
  menuPrincipal.style.display = 'none';
  if (!vitoria) somGameOver();
}

function reiniciar() {
  emJogo = false;
  imgOverlay = null;
  floresPegas = 0;
  tempoRestante = 30;
  vidas = 3;
  aranhas = [];
  criarFlores(6);
}
