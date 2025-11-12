function openNav() {
  document.getElementById("menuLateral").style.width = "250px";
}

function closeNav() {
  document.getElementById("menuLateral").style.width = "0";
}

function mudarFonte(fonte) {
  document.body.style.fontFamily = fonte;
}

const imagens = document.querySelectorAll('#carrosselImagens img');
const carrosselImagens = document.getElementById('carrosselImagens');
let indexAtual = 0;

function mostrarImagem(index) {
  const larguraImagem = imagens[0].clientWidth;
  carrosselImagens.style.transform = `translateX(-${index * larguraImagem}px)`;
}

function abrirPopup(pagina) {
  document.getElementById("iframePopup").src = pagina;
  document.getElementById("popup").style.display = "flex";
  }
  
  function fecharPopup() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("iframePopup").src = "";
  }
  window.fecharPopup=fecharPopup;

document.getElementById('prevBtn').addEventListener('click', () => {
  indexAtual = (indexAtual - 1 + imagens.length) % imagens.length;
  mostrarImagem(indexAtual);
});

document.getElementById('nextBtn').addEventListener('click', () => {
  indexAtual = (indexAtual + 1) % imagens.length;
  mostrarImagem(indexAtual);
});


window.addEventListener('resize', () => mostrarImagem(indexAtual)); 

