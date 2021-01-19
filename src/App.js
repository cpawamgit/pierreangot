import './App.css';
import files from "./site.json";
import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
//import { act } from 'react-dom/test-utils';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;



const isSmatphone = detectMob();

function detectMob() {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}

function PopUp(props) {
  return (
    <div className={isSmatphone ? "popUpDivPhone" : "popUpDiv"}>
      <p>Certains documents sont très lourds et peuvent mettre du temps à charger.</p>
      <p>Veuillez noter que les documents contiennent des pages blanches pour le tirage</p>
      <p>Cliquer sur ok pour faire disparaitre ce message</p>
      <button onClick={props.hidePopUp}>
        OK !
        </button>
    </div>
  );
}

function PdfDisplayer(props) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function clickDownloadPhone() {
    document.getElementById("download-link").click();
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }
  const toDisplay = `${process.env.PUBLIC_URL}${props.name}`;
  const phoneDownload = isSmatphone ?
    <a id="download-link" onClick={clickDownloadPhone} download={toDisplay} href={toDisplay}><p id="phone-download-text">Télécharger</p></a> :
    <a id="download-link" download={toDisplay} href={toDisplay}>Télécharger</a>
  const downloadButton = isSmatphone ? <button onClick={clickDownloadPhone} id={isSmatphone ? "download-button-phone" : "download-button"}>
    {phoneDownload}
  </button>
    :
    <button id={isSmatphone ? "download-button-phone" : "download-button"}>
      {phoneDownload}
    </button>
  const pageNumberDisplay = <p id="page-number">
    Page {pageNumber || (numPages ? 1 : '--')} sur {numPages || '--'}
  </p>
  const buttons = <div className={isSmatphone ? "navigationButtonsPhone" : "navigationButtons"}>
    {!isSmatphone && pageNumberDisplay}
    <button
      id={isSmatphone ? "previous-button-phone" : "previous-button"}
      type="button"
      disabled={pageNumber <= 1}
      onClick={previousPage}
    >
      {isSmatphone ? null : "Précédent"}
    </button>
    <button
      id={isSmatphone ? "next-button-phone" : "next-button"}
      type="button"
      disabled={pageNumber >= numPages}
      onClick={nextPage}
    >
      {isSmatphone ? null : "Suivant"}
    </button>
    {!isSmatphone &&
      <button onClick={() => { props.changeScale(0.2) }}>
        {isSmatphone ? null : "Agrandir"}
      </button>
    }
    {!isSmatphone &&
      <button onClick={() => { props.changeScale(-0.2) }}>
        {isSmatphone ? null : "Rétrécir"}
      </button>
    }
    <button id={isSmatphone ? "rotation-button-phone" : "rotation-button"} onClick={() => { props.changeRotation() }}>
      {isSmatphone ? null : "Rotation"}
    </button>
    {downloadButton}
  </div>
  const appWrapperStyle = props.rotate === 90 ? { left: 0 } : props.rotate === 270 ? { left: 0 } : null;
  const phoneDocument = isSmatphone ? "phoneDocument" : null;
  return (
    <div style={appWrapperStyle} id="appWrapper" className={isSmatphone ? "appWrapperPhone" : "appWrapper"}>
      <div className={phoneDocument}>
      <Document
        file={toDisplay}
        onLoadSuccess={onDocumentLoadSuccess}
        style={{ margin: 0, padding: 0 }}
        error=""
      >
        <Page pageNumber={pageNumber}
          height={800}
          style={{ margin: 0, padding: 0 }}
          scale={props.scale}
          renderMode="svg"
          rotate={props.rotate}
          error=""
        />
      </Document>
      </div>
      {isSmatphone ? props.displaySearchMenu ? null : pageNumberDisplay : null}
      {isSmatphone ? props.displaySearchMenu ? null : buttons : buttons}

    </div>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      baseButton: true,
      fullPath: '/sitePdfs/', //building after clicking each new button, i have to implement a return button two
      fileName: '',
      actualObject: [...files[0].contents],
      scale: isSmatphone ? 0.61 : 1,
      displayHome: true,
      displayBrowse: false,
      displayPrice: false,
      loading: false,
      rotation: 0,
      popUp: false,
      blockPopUp: false,
      displaySearchMenu: true,
      language: "Français",
    }
    this.displayListHandleClick = this.displayListHandleClick.bind(this);
    this.reinitState = this.reinitState.bind(this);
    this.changeScale = this.changeScale.bind(this);
    this.displayBrowse = this.displayBrowse.bind(this);
    this.displayHome = this.displayHome.bind(this);
    this.displayPrice = this.displayPrice.bind(this);
    this.rotate = this.rotate.bind(this);
    this.endLoading = this.endLoading.bind(this);
    this.returnFunc = this.returnFunc.bind(this);
    this.hidePopUp = this.hidePopUp.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
    this.toggleLanguage = this.toggleLanguage.bind(this);
  }

  toggleLanguage(){
    if (this.state.language === "Français"){
      this.setState({
        language: "English"
      })
    }
    else{
      this.setState({
        language: "Français"
      })
    }
  }

  toggleMenu() {
    this.setState({
      displaySearchMenu: !this.state.displaySearchMenu
    })
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
    });
  }

  changeScale(value) {
    this.setState({
      scale: this.state.scale + value
    });
  }

  rotate() {
    if (this.state.rotation === 270)
      this.setState({
        rotation: 0
      });
    else {
      this.setState({
        rotation: this.state.rotation + 90
      });
    }
  }

  returnFunc() {
    let actualPath = this.state.fullPath.split('/');
    actualPath = actualPath.filter(item => item !== "");
    let newPathDisplay = "/";
    let obj1 = [...files];
    if (actualPath.length > 1) {
      actualPath.pop();
      actualPath[0] = "sitePdfs/";
      newPathDisplay += `${actualPath.join('/')}/`;
      for (let i = 0; i < actualPath.length; i++) {
        obj1 = obj1.filter(item => item.name === actualPath[i]);
        obj1 = obj1[0];
        obj1 = obj1.contents;
      }
      this.setState({
        actualObject: obj1,
        fullPath: newPathDisplay
      });
    }

  }

  displayListHandleClick(name, typeofbutton, index) {
    if (typeofbutton === "directory") {
      this.setState({
        actualObject: this.state.actualObject[index].contents,
        fullPath: this.state.fullPath + `${name}/`
      });
    }
    else {
      this.setState({
        fileName: `${this.state.fullPath}${name}`,
        loading: true
      });
      setTimeout(this.endLoading, 2200)
    }
    this.scrollToTop();
  }

  hidePopUp() {
    this.setState({
      blockPopUp: true
    });
  }

  endLoading() {
    if (isSmatphone) {
      this.toggleMenu();
    }
    this.setState({
      loading: false
    })
  }

  reinitState() {
    this.setState({
      baseButton: true,
      fullPath: '/sitePdfs/',
      fileName: '',
      actualObject: [],
      scale: 1
    });
  }

  displayHome() {
    this.setState({
      displayHome: true,
      displayBrowse: false,
      dislayWiki: false,
      displayPrice: false
    });
  }

  displayBrowse() {
    this.setState({
      displayHome: false,
      displayBrowse: true,
      dislayWiki: false,
      displayPrice: false,
      popUp: true
    });
    this.scrollToTop();
  }

  displayPrice() {
    this.setState({
      displayHome: false,
      displayBrowse: false,
      dislayWiki: false,
      displayPrice: true
    });
  }

  render() {
    const headerDiv = <div className="header">
      <h1>Pierre Angot, {this.state.language === "Français" ? "Compositeur Français" : "French Composer"}</h1>
      <div className="menu">
        <p onClick={this.displayHome}>{this.state.language === "Français" ? "Acceuil" : "Home"}</p>
        <p onClick={this.displayBrowse}>{this.state.language === "Français" ? "Parcourir les partitions" : "Browse scores"}</p>
        <a href="https://fr.wikipedia.org/wiki/Pierre_Angot" rel="noreferrer" target="_blank" id="wiki">Wikipedia</a>
        <p onClick={this.displayPrice}>{this.state.language === "Français" ? "Tarifs et droits d'utilisation" : "Tariffs and rights of use"}</p>
      </div>
    </div>
    const pathStyle = this.state.loading ? { color: "red", height: "max-content" } : null;
    const returnButton = <button className={isSmatphone ? "displayListPhone" : "displayList"} style={{ cursor: 'pointer' }} onClick={this.returnFunc}>Retour</button>
    const displayList = this.state.actualObject.map((item, index) => {
      return (
        <button onClick={() => { this.displayListHandleClick(item.name, item.type, index) }}
          className={isSmatphone ? "displayListPhone" : "displayList"}
          index={index} key={item.name}
          typeofbutton={item.type}
          style={{ cursor: 'pointer' }}
        >
          {item.name}
        </button>
      );
    });
    displayList.unshift(returnButton);
    const pathToDisplay = "Chemin : " + this.state.fullPath.slice(10);
    displayList.unshift(<button className={isSmatphone ? "displayListPhone" : "displayList"} style={pathStyle}>{pathToDisplay}{this.state.loading && "...Chargement du document"}</button>);
    const displayDiv = <div className={isSmatphone ? "displayDivPhone" : "displayDiv"}>{displayList}</div>
    const fileBrowserHeader = <div className="fileBrowserHeader">
      <button onClick={this.toggleMenu}>Menu</button>
      <button onClick={this.displayHome}>Acceuil</button>
    </div>
    const searchDiv = <div className={isSmatphone ? "searchDivPhone" : "searchDiv"}>
      {this.state.displayBrowse && displayDiv}
    </div>
    return (
      <div className="master-div">
        <button onClick={this.toggleLanguage} id="language">{this.state.language === "Français" ? "English" : "Français"}</button>
        {isSmatphone ? this.state.displayBrowse ? fileBrowserHeader : headerDiv : headerDiv}
        {this.state.displayBrowse &&
          <div className={isSmatphone ? "searchAndDisplayPhone" : "searchAndDisplay"}>
            {this.state.popUp && !this.state.blockPopUp && <PopUp hidePopUp={this.hidePopUp} />}
            {this.state.displaySearchMenu && searchDiv}
            <PdfDisplayer
              id="wrapp"
              name={this.state.fileName}
              scale={this.state.scale}
              changeScale={this.changeScale}
              rotate={this.state.rotation}
              changeRotation={this.rotate}
              displaySearchMenu={this.state.displaySearchMenu}
            />
          </div>}
        {this.state.displayHome &&
          <div className="homeDiv-master">
            <div className="homeDiv"> {/*backgroundDiv*/}

            </div>
            <div className="homeTextWrapper">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Pierre_%26_Micka%C3%ABl_02.JPG"
                alt="Pierre Angot"
                height="222px"
                width="198"
              >
              </img>
               <h2>{this.state.language === "Français" ? "Ajouter et ne rien détruire" : "Add and do not destroy"}</h2>
              <p>{this.state.language === "Français" ? "Pierre ANGOT est un compositeur français né en Normandie , le premier mars 1958. Dans sa jeunesse il fût autant musicien de jazz que d'orchestre, il sera aussi professeur de basson." : "Pierre ANGOT is a French composer born in Normandy on March 1, 1958. In his youth he was as much a jazz musician as an orchestra, he was also a bassoon teacher."}
</p>
              <p>
                {this.state.language === "Français" ? "Elève en composition d'Alain Abbot il s'en détournera rapidement se mettant en rupture dans les années 90 jusqu’à détruire son travail accompli jusque là : il le jugera trop  conforme à la doxa musicale de la deuxième partie du 20ème siècle jusqu'à aujourd'hui." : "Pupil in composition of Alain Abbot he will turn away quickly breaking in the 90s until destroying his work accomplished until then: he will judge it too conforms to the musical doxa of the second part of the 20th century until today."}
</p>
              <p>
                {this.state.language === "Français" ? "Pour lui, sa production débutera donc réellement en 2002 avec la \"Sonatine Picturale\", créée cette même année par le pianiste Mickaël Bardin. Il  reniera donc toutes ses pièces antérieures  sauf ce qu'il comptera pour ses 4 premiers Opus qui sont plus de l'ordre de la gageure musicale. Il cherchera à retrouver le contact avec le public perdu dans les courants de l'école de Darmstadt, notamment sériel ou musique concrète. Il ne prêtera pas  plus d'intérêt aux dernières mouvances telles  que le néo tonalisme. On peut donc difficilement qualifier la musique de Pierre ANGOT,  si ce n'est qu'elle est le fruit incessant de longues recherches sur le plan esthétique, recherchant à redonner une vérité émotionnelle à la musique dite savante." : "For him, his production will therefore really begin in 2002 with the \"Sonatine Picturale\", created that same year by pianist Mickaël Bardin. He will therefore renounce all his previous pieces except what he will count for his first 4 Opus which are more of a musical challenge. He will seek to find contact with the public lost in the currents of the Darmstadt school, in particular serial or concrete music. It will not pay more interest to the latest movements such as neo-tonalism. It is therefore difficult to qualify the music of Pierre ANGOT, except that it is the incessant fruit of long research on the aesthetic level, seeking to restore emotional truth to so-called scholarly music."}
</p>
              <p>
                {this.state.language === "Français" ? "Son engouement ira à des compositeurs tels qu'Henri Tomasi  ou  Henri Dutilleux pour renouveler le langage musical. La recherche obsessionnelle de nouvelles couleurs musicales, sans jamais se départir de l'héritage du passé, peut qualifier la démarche de Pierre ANGOT :  \"Ajouter et ne rien détruire\" pourrait être sa devise." : "His enthusiasm will go to composers such as Henri Tomasi or Henri Dutilleux to renew the musical language. The obsessive search for new musical colors, without ever departing from the heritage of the past, can qualify Pierre ANGOT's approach: \"Add and do not destroy anything\" could be his motto."}
</p>

            </div>

          </div>
        }
        {this.state.displayPrice &&
          <div className="priceMaster">
            <div className="priceDiv">

            </div>
            <div className="priceDivWrapper">
              <h2>Prix pour chaque exécution public </h2>
              <p>Opus 1</p>
              <ul>
                <li>le concert des profs : libre de droit</li>
                <li>Musique de scène : 75€</li>
              </ul>
              <p>Opus 2</p>
              <ul>
                <li>Duo : libre de droit</li>
                <li>Trio : 80€</li>
              </ul>
              <p>Opus 3 : 150€</p>
              <p>Opus 4 : 70€</p>
              <p>Opus 5 : 120€</p>
              <p>Opus 6</p>
              <ul>
                <li>Ragtime : 20 €</li>
                <li>Sonatine drolatique : 120€</li>
              </ul>
              <p>Opus 7</p>
              <ul>
                <li>5 petites pièces suaves : 15 €</li>
                <li>8 petites pièces : Libre de droit</li>
                <li>L'infant : Libre de droit</li>
                <li>Spleen : 80€</li>
              </ul>
              <p>Opus 8 : 25€</p>
              <p>Opus 9</p>
              <ul>
                <li>Andante et allegro : 70€</li>
                <li>Fantaisie romantique : 70€</li>
                <li>Laconique sonatine : 70€</li>
                <li>Rapsodie fantasque : 80€</li>
              </ul>
              <p>Opus 10 : 180€</p>
              <p>Opus 11</p>
              <ul>
                <li>Badinage : Libre de droit</li>
                <li>L'aurore : 65€</li>
              </ul>
              <p>Opus 12 : 65€</p>
              <p>Opus 13 : 900€</p>
              <p>Opus 14 : 180€</p>
              <p>Opus 15</p>
              <ul>
                <li>Improvisation : Libre de droit</li>
                <li>Peregrination 80€</li>
              </ul>
              <p>Opus 16 : </p>
              <ul>
                <li>version 2000 250€</li>
                <li>version trio 300€</li>
                <li>version 2010 250€</li>
              </ul>
              <p>Opus 17 : Astarte ou Ishtar : 80€</p>
              <p>Opus 18 : Brocéliande version 2001 ou 2006 : 280€</p>
              <p>Opus 19 : </p>
              <ul>
                <li>version 2000 : 850€</li>
                <li>version 2008 : 960€</li>
              </ul>
              <p>Opus 20 : </p>
              <ul>
                <li>Figure dans la ville trompette piano : 270€</li>
                <li>Figure dans la ville  piano 4 mains : 280€</li>
                <li>Ivresse 250€</li>
              </ul>
              <p>Opus 21 : </p>
              <ul>
                <li>Largo et presto : 130€</li>
                <li>Rapsodie exotique : libre de droit</li>
              </ul>
              <p>Opus 22 : 110€</p>
              <p>Opus 23 : 1200€</p>
              <p>Opus 24 : 55€</p>
              <p>Opus 25 : 450€</p>
              <p>Opus 26 : 1300€</p>
              <p>Opus 27 : 120€</p>
              <p>Opus 28 : 850€</p>
              <p>Opus 29 : 40€</p>
              <p>Opus 30 : 80€</p>
              <p>Opus 31 : 300€</p>
              <p>Opus 32</p>
              <ul>
                <li>2 small danses : 35€</li>
                <li>3 cartes postales : 120€</li>
                <li>Complainte jeux et danse : libre de droit</li>
                <li>Duo : libre de droit</li>
                <li>Duo fantasque : 40€</li>
                <li>Mini quatuor : 80€</li>
                <li>Nostalgie : 80€</li>
              </ul>
              <p>Opus 33 : Hautbois ou sax soprano : 250€</p>
              <p>Opus 34</p>
              <ul>
                <li>Version da camera : 350€</li>
                <li>Version quatuor: 200€</li>
              </ul>
              <p>Opus 35 : 950€</p>
              <p>Opus 36 : 200€</p>
              <p>Opus 37 : 200€</p>
              <p>Opus 38 : version violoncelle ou alto : 110€</p>
              <p>Opus 39 : 160€</p>
              <p>Opus 40 : 180€</p>
              <p>Opus 41 : 100€</p>
              <p>Opus 42 : chaque version 120 €</p>
              <p>Opus 43 : N°1 ou N°2 : 120 €</p>
              <p>Opus 44 : 280 €</p>
              <p>Opus 45 : 880 €</p>
              <p>Opus 46 : 640 €</p>
              <p>Opus 47 : 130 €</p>
              <p>Opus 48 : 680 €</p>
              <p>Opus 49 : 310 €</p>
              <p>Opus 50</p>
              <ul>
                <li>Cimaise 6 : 180€</li>
                <li>Fantaisie dégingandée: 750€</li>
              </ul>
              <p>Opus 51 : 280 €</p>
              <p>Opus 52</p>
              <ul>
                <li>N°1 : 620€</li>
                <li>N°2 : 370€</li>
              </ul>
              <p>Opus 53 : 180 €</p>
              <p>Opus 54 : 500 €</p>
              <p>Opus 55 : 300 €</p>
              <p>Opus 56 : 180 €</p>
              <h2><a href="mailto: cyril.morin.tai@gmail.com">Contact : cyril.morin.tai@gmail.com</a></h2>

            </div>

          </div>
        }
        <div className="footer">
          <h2>Design :</h2>
          <p>Cyril Morin</p>
          <p>Find me at : <a href="http://www.cyrilmorin.fr" target="_blank" rel="noreferrer">cyrilmorin.fr</a></p>
          {isSmatphone ? this.state.displayBrowse ? 
          <div id="icon-credit">
            <p>Icons creators :</p>
            <p>Icons made by <a href="http://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></p>
<p>Icons made by <a href="http://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></p>
<p>Icons made by <a href="https://www.flaticon.com/free-icon/add_992651?related_id=992651" title="dmitri13">dmitri13</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></p>
<p>Icons made by <a href="https://www.flaticon.com/authors/kiranshastry" title="Kiranshastry">Kiranshastry</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></p>
          </div> : null : null}
        </div>
      </div>
    );
  }

}

export default App;
