#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

const cmdArgs = process.argv;
const readline = require('readline');
const HOST = process.env.host;
const API_KEY = process.env.api_key;
const dictArg = cmdArgs[2];
console.log(HOST)
const getApiReq = (endPoint, word) => {
    return axios.get(`${HOST}/word/${word}/${endPoint}?api_key=${API_KEY}`)
}

const getDictOfWord = (word) => {
    getDefinationOfWord(word).then(resp => {
        console.log(`Here is the defination of ${word}`);
        resp.forEach((ele, index) => {
            console.log(index +1, ' - ', ele.text);
        });
    }).catch(err => {
        console.log(err);
    });
    getSynonymOfWord(word).then(resp => {
        let syn = resp[0];
        console.log(`Here is the synonym of ${word}`);
        console.log(syn.words.join(', '));
    }).catch(err => {
        console.log(err);
    });
    getAntonymOfWord(word).then(resp => {
        let ant = resp[0];
        console.log(`Here is the Antonym of ${word}`);
        console.log(ant.words.join(', '));
    }).catch(err => {
        console.log(err);
    });
    getExampleOfWord(word).then(resp => {
        console.log(`Here is the exampes for ${word} word`);
        resp.forEach((ele, index) => {
            console.log(index +1, ' - ', ele.text);
        });
    }).catch(err =>{
        console.log(err);
    });
}

const getDefinationOfWord = (word) => {
    return new Promise((resolve, reject)=> {
        getApiReq('definitions', word).then(resp => {
            if(resp.data && resp.data.length > 0) {
                resolve(resp.data)
            } else {
                reject('No synonym Found For ' + word);
            }
        }).catch(err => {
            reject('No defination Found For ' + word);
        });
    });
} 

const getAntonymAndSynonymOfWord = (word) => {
    return new Promise((resolve, reject)=> {
        getApiReq('relatedWords', word).then(resp => {
            if(resp.data && resp.data.length > 0) {
                resolve(resp.data);
            } else {
                reject('No synonyms Found For ' + word)
            }
            resolve(synonyms);
        }).catch(err => {
            reject('No synonyms Found For ' + word);
        });
    });
}

const getSynonymOfWord = (word) => {
    return new Promise((resolve, reject)=> {
        getApiReq('relatedWords', word).then(resp => {
            if(resp.data && resp.data.length > 0) {
                let synonyms = resp.data.filter(el => el.relationshipType == 'synonym');
                if(synonyms && synonyms.length > 0) {
                    resolve(synonyms)
                } else {
                    reject('No synonyms Found For ' + word)
                }
            } else {
                reject('No synonyms Found For ' + word)
            }
            resolve(synonyms);
        }).catch(err => {
            reject('No synonyms Found For ' + word);
        });
    });
}

const getAntonymOfWord = (word) => {
    return new Promise((resolve, reject)=> {
        getApiReq('relatedWords', word).then(resp => {
            if(resp.data && resp.data.length > 0) {
                let antonyms = resp.data.filter(el => el.relationshipType == 'antonym');
                if(antonyms && antonyms.length > 0) {
                    resolve(antonyms)
                } else {
                    reject('No antonyms Found For ' + word)
                }
            } else {
                reject('No antonyms Found For ' + word)
            }
        }).catch(err => {
            reject('No defination Found For ' + word);
        });
    });
}

const getExampleOfWord = (word) => {
    return new Promise((resolve, reject)=> {
        getApiReq('examples', word).then(resp => {
            if(resp.data && resp.data.examples) {
                let examples = resp.data.examples;
                resolve(examples);
            } else {
                reject('No examples Found For ' + word)
            }
        }).catch(err => {
            console.log(err);
            reject('No examples Found For ' + word);
        });
    });
}

const getRandomWord = () => {
    return new Promise((resolve, reject) => {
        axios.get(`${HOST}/words/randomWord?api_key=${API_KEY}`).then(resp => {
            if(resp.data && resp.data.word) {
                resolve(resp.data['word']);
            } else {
                reject(`Sorry Not able to find word `);
            }
        }).catch(err => {
            reject(`Sorry Not able to find word `);
        });
    })
}

switch(dictArg) {
    case 'defn' : 
        getDefinationOfWord(cmdArgs[3]).then(resp => {
            console.log(`Here is the defination of ${cmdArgs[3]}`);
            resp.forEach((ele, index) => {
                console.log(index +1, ' - ', ele.text);
            });
        }).catch(err => {
            console.log(err);
        });
        break ;
    case 'syn' : 
        getSynonymOfWord(cmdArgs[3]).then(resp => {
            let syn = resp[0];
            console.log(`Here is the synonym of ${cmdArgs[3]}`);
            console.log(syn.words.join(', '));
        }).catch(err => {
            console.log(err);
        });
        break;
    case 'ant' : 
        getAntonymOfWord(cmdArgs[3]).then(resp => {
            let ant = resp[0];
            console.log(`Here is the antonym of ${cmdArgs[3]}`);
            console.log(ant.words.join(', '));
        }).catch(err => {
            console.log(err);
        });
        break;
    case 'ex' : 
        getExampleOfWord(cmdArgs[3]).then(resp => {
            console.log(`Here is the examples for ${cmdArgs[3]} word`);
            resp.forEach((ele, index) => {
                console.log(index +1, ' - ', ele.text);
            });
        }).catch(err =>{
            console.log(err);
        });
        break;
    case 'play' : 
        getRandomWord().then(async (word) => {
            var rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
              });
            getDefinationOfWord(word).then(async (defn) => {
                console.log('Here is the definations of word -> ', defn[0].text);
                let antSyn = [];
                try {
                    antSyn = await getAntonymAndSynonymOfWord(word);
                } catch (e) {}
                let antonyms = antSyn.filter(el => el.relationshipType == 'antonym');
                let synonyms = antSyn.filter(el => el.relationshipType == 'synonym');
                let synWordArrr = [];
                if(synonyms && synonyms.length > 0 && synonyms[0].words) {
                    console.log('synonyms of word -> ', synonyms[0].words[0]);
                    synWordArrr = synonyms.words || [];
                }
                if(antonyms && antonyms.length > 0 && antonyms[0].words) {
                    console.log('antonyms of word  -> ', antonyms[0].words[0]);
                }
                rl.question("Can you guess the word? ", function(answer) {
                    if(answer == word && synWordArrr.indexOf(answer) != -1) {
                        console.log('Hurray, correct answer');
                    } else {
                        console.log("oops, that's wrong answer");
                        console.log('enter 1 to try again, enter 2 for hint, enter 3 for exit')
                        rl.question('', function(choice) {
                            if(choice == '1') {
                                rl.question("guess the word? ", function(ans) { 
                                    if(ans == word) {
                                        console.log('Hurray, correct answer');
                                    }else {
                                        console.log("that's Incorrect")
                                    }
                                    rl.close();
                                })
                            } else if(choice == '2') {
                                let hint = ['rand', 'ant', 'syn', 'defn'];
                                let shuffleHint = hint.sort(() => Math.random() - 0.5)[0];
                                if(shuffleHint == 'rand') {
                                    String.prototype.shuffle = function () {
                                        var a = this.split(""),
                                            n = a.length;
                                    
                                        for(var i = n - 1; i > 0; i--) {
                                            var j = Math.floor(Math.random() * (i + 1));
                                            var tmp = a[i];
                                            a[i] = a[j];
                                            a[j] = tmp;
                                        }
                                        return a.join("");
                                    }
                                    console.log("Here's the shuffled word ", word.shuffle(), ', ', word.shuffle(), ', ', word.shuffle());
                                } else if (shuffleHint == 'ant') {
                                    if(antonyms && antonyms.length > 0) {
                                        console.log("Here's the antonym of the word", antonyms[0].words[Math.floor(Math.random() * antonyms[0].words.length)]);
                                    } else {
                                        console.log("Here's defination of word",defn[Math.floor(Math.random() * defn.length)].text);
                                    }
                                } else if(shuffleHint == 'syn') {
                                    if(synWordArrr.length>0) {
                                        console.log("Here's the synonym of the word", synWordArrr[Math.floor(Math.random() * synWordArrr.length)]);
                                    } else {
                                        console.log("Here's defination of word",defn[Math.floor(Math.random() * defn.length)].text);
                                    }
                                } else {
                                    console.log("Here's defination of word",defn[Math.floor(Math.random() * defn.length)].text);
                                }
                                rl.question("guess the word? ", function(answ) { 
                                    if(answ == word) {
                                        console.log('Hurray, correct answer');
                                    } else {
                                        console.log("that's Incorrect")
                                    }
                                    rl.close();
                                })
                            } else {
                                console.log(`Correct word is ${word}`);
                                rl.close();
                            }
                        })
                    }
                }); 
            }).catch(err => {});
        }).catch(err => {
            console.log(err)
        });
        break;
    default :
        if(cmdArgs[2]) {
            getDictOfWord(cmdArgs[2]);
        } else {
            getRandomWord().then(word => {
                console.log('Random word Found ->', word);
                getDictOfWord(word);
            }).catch(err => {
                console.log(err)
            });
        }
        break;
}
