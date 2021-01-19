export const nls = {
  fr: {
    _languages: {
      'fr': 'français',
      'en': 'anglais',
      'es': 'espagnol',
      'de': 'allemand',
      'it': 'italien',
      'zh': 'chinois',
      'sv': 'suédois'
    },
    'error.retry': "Une erreur est survenue. Veuillez retenter.",
    'no.results': "Aucun résultats",
    'quota.exceeded': "Vous ne pouvez plus envoyez de messages en ###BLOCKED_LANGUAGE###. Veuillez participer plus en ###OTHER_LANGUAGES###.",
    'message.too.long': "Le message ne peut excéder 1000 caractères",
    'message.param.mandatory': "Veuillez saisir un message",
    call: {
      incoming: {
        title: "Appel entrant",
        text: "Appel entrant de ###FROM### en ###LANGUAGE###",
      },
      permission: {
        title: "Demande de participation",
        text: "###FROM### demande à participer à la conversation en tant que ###ROLE###"
      },
      ask: {
        title: "Demande de participation",
        text: "Demandez à participer à la conversation avec ###PARTICIPANTS###",
        role: {
          speaker: "Orateur",
          audience: "Auditeur"
        }
      },
      actions: {
        accept: 'Accepter',
        reject: 'Décliner'
      },
      me: 'moi',
      hasleft: "###PARTICIPANT### a quitté la conversation",
      hasjoined: "###PARTICIPANT### a rejoint la conversation",
      roomcreated: "Nouvelle discussion créé",
      denied: "Appel rejeté",
      errors: {
        init: "Impossible d'initialiser l'appel",
        joinfailed: "Impossible de rejoindre la discussion",
        streaminit: "Impossible de démarrer le micro"
      }
    },
    'logIn': 'Connexion',
    login: {
      badcredentials: "Identifiants non reconnus",
    },
    header: {
      inbox: 'Nouveaux messages',
      logout: 'Déconnexion',
      profile: 'Profil',
      languagechoice: 'Choix de la langue'
    },
    digression: {
      room: {
        "fetch.error": "Erreur à la récupération des discussion audio en cours."
      }
    },
    choice: {
      teach: "Partager",
      learn: "Apprendre"
    },
    profile: {
      title: 'Profil',
      intro: 'Dites-nous en plus sur vous'
    },
    errors: {
      post: "Erreur lors de l'envoi des informations",
      emailorpseudoused: "Email ou pseudo déjà utilisé",
      languagesgte2: "Vous devriez au moins sélectionner 2 langues",
      passwordmandatory: "Mot de passe obligatoire",
      pseudomandatory: "Pseudo obligatoire",
      emailmandatory: "Email obligatoire",
      maternalLanguagesmandatory: "Veuillez renseigner vos langues maternelles",
      apprenticeLanguagesmandatory: "Veuillez renseigner les lanques à apprendre",
      apprenticeLanguagesinmaternalLanguages: "Les langues à apprendre et les langues maternelles doivent être distinctes"
    },
    actions: {
      cancel: 'Annuler'
    },
  }
};

export const getNls = function(access, params) {
  try {
    if(!access) {
      return '';
    }
    let val = nls['fr'];
    if(typeof(access) === 'string') {
      val = val[access];
      if(!val) {
        val = nls['fr'];
        const splitted = access.split(".");
        for (let i = 0; i < splitted.length; i++) {
          val = val[splitted[i]];
        }
      }
    } else {
      for (let i = 0; i < access.length; i++) {
        val = val[access[i]];
      }
    }
    if(val && params) {
      Object.keys(params).forEach(errorKey => {
        const re = RegExp('###' + errorKey + '###', 'g');
        val = val.replace(re, params[errorKey]);
      })
    }
    return val;
  } catch (error) {
    console.error(error);
    return access;
  }
};

export const getLanguageName = function(code) {
  return getNls(['_languages', code]);
}
