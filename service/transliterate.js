export const transliterate = (text) => {
  const map = {
      'а': 'a', 'ә': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'ғ': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'қ': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'ң': 'n', 
      'о': 'o', 'ө': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ұ': 'u', 'ү': 'u', 'ф': 'f', 
      'х': 'h', 'һ': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': '', 'ы': 'y', 'і': 'i', 
      'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };

  return text
      .split('')
      .map((letter, index) => {
          let translit = map[letter.toLowerCase()] || letter; // Получаем транслитерацию
          if (index === 0) {
              // Делаем первую букву заглавной, а остальное строчным
              return translit.charAt(0).toUpperCase() + translit.slice(1);
          }
          return translit;
      })
      .join('')
      .replace(/'/g, ''); // Убираем апострофы
};
