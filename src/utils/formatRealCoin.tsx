export default function formatCurrencyInput(value: string) {
    const digits = value.replace(/\D/g, '');
    const number = Number(digits) / 100;
    return digits ? number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '';
}