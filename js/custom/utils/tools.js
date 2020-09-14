/**
 * Contém "ferramentas" usadas em todo o sistema
 * @module Tools
 */

 /**
  * Função que converte um Valor passado em uma Cor em Hex tendo como padrão uma variação entre Vermelho e Verde
  * @param {number} percent - Valor a ser convertido
  * @param {number} min - Valor Mínimo a ser levado em consideração (Verde)
  * @param {number} max - Valor Máximo a ser levado em condideração (Vermelho)
  * @returns {string} String que representa a Cor me Hex do valor recebido
  */
export function percentToColor(percent, min, max) {
    if (percent <= 0) {
        return '#00FF00';
    }
    else if (percent >= 100) {
        return '#FF0000';
    }

    const diff = max - min;
    let red = 0;
    let green = 0;
    const blue = 0;

    if (diff === 0) {
        percent = 100;
    }
    else {
        percent = (percent - min) / diff * 100;
    }

    if (percent < 50) {
        red = 255;
        green = Math.round(5.1 * percent);
    }
    else {
        green = 255;
        red = Math.round(510 - 5.1 * percent);
    }

    const hex = red * 0x10000 + green * 0x100 + blue * 0x1;
    return '#' + ('000000' + hex.toString(16)).slice(-6);
}

/**
 * Mapeia um valor passado de um intervalo para outro intervalo
 * @param {number} value - Valor a ser Mapeado
 * @param {number[]} from - Intervalo de Mapeamento inicial [min, max]
 * @param {number[]} to - Intervalo de Mapeamento final [min, max]
 * @returns {number} Valor final após o remapeamento
 */
export function mapValue(value, from, to) {
    return to[0] + (value - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
}
