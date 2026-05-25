export const masks: any = {
  unmask: (string: string) => string.replace(/[^a-zA-Z0-9]/g, ''),
  number: (string: string) => string.replace(/\D/g, ''),
  state: (string: string) => string.replace(/\d/, ''),
  hour: (string: string) =>
    String(string)
      .replace(/\D/, '')
      .replace(/(\d{2})(\d)/, '$1:$2'),
  showHour: (string: string) => {
    string = String(string)
    return string.length === 3
      ? string.replace(/(\d{1})(\d)/, '$1h$2')
      : string.replace(/(\d{2})(\d)/, '$1h$2')
  },
  cpf: (string: string) =>
    string
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1'),
  rg: (string: string) =>
    string
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{1})\d+?$/, '$1'),
  cnpj: (string: string) =>
    string
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1'),
  document: (string: string) => {
    if (string.length <= 14) {
      return string
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
    }

    return string
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  },
  zipcode: (string: string) =>
    string
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1'),
  phone: (string: string) =>
    string
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{5})\d+?$/, '$1'),
  cell: (string: string) =>
    string
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1'),
  currency: (value: string) => {
    const string = value.toString()

    if (string.replace(/\D/g, '') !== '')
      return (parseInt(string.replace(/\D/g, ''), 10) / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
      })

    return '0,00'
  },
  currencyAllPlatforms: (value: number) => {
    value = Number(value)

    if (typeof value === 'number') {
      const [currency, cents] = (value / 100).toFixed(2).toString().split('.')

      return `R$ ${currency.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${cents}`
    }

    return 'R$ 0,00'
  },
  percentage: (string: string) => {
    let number = Number(String(string).replace(/\D/g, ''))
    if (number > 100) number = 100
    return `${number}`
  },
  creditCard: (value: string) =>
    value
      .replace(/\D/g, '')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(.\d{4})\d+?$/, '$1'),

  creditCardDate: (value: string) => {
    value = value
      .replace(/\D/g, '')
      .replace(/([\d]{4})/, '$1')
      .replace(/([\d]{4})[\d]+?$/, '$1')
      .replace(/([\d]{2})([\d]{1})/, '$1/$2')
    const dates = value.split('/')
    if (dates.length) {
      if (parseInt(dates[0], 10) > 12) dates[0] = '12'
      return dates.join('/')
    }
    return value
  },
  cvv: (value: string) =>
    value
      .replace(/[^\d]/g, '')
      .replace(/([\d]{4})/, '$1')
      .replace(/([\d]{4})[\d]+?$/, '$1'),
}
