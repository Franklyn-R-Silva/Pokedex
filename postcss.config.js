// Autoprefixer aplica prefixos de fornecedor (-webkit-, -moz-) conforme o
// browserslist do package.json, garantindo compatibilidade cross-browser.
import autoprefixer from 'autoprefixer';

export default {
  plugins: [autoprefixer()],
};
