/*eslint max-statements: ["error", 26] */
console.log('Entering index.js');

require(['modules/salt-module1'], function(alphabet) {
    console.log('require is loaded');
    console.log('Our defined alphabet is', String(alphabet.length), 'letters long.');
})

require(['modules/salt-module2'], function(alphabet) {
    console.log(alphabet);
})