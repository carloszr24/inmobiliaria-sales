export type Review = {
  id: number
  name: string
  text: string
}

export const GOOGLE_RATING = 5

export const REVIEWS: Review[] = [
  {
    id: 1,
    name: 'Maria Dolores Antunez Aragones',
    text: 'La atención y el trato es súper profesional y los resultados mucho más de lo esperado.',
  },
  {
    id: 2,
    name: 'Aurora López Torres',
    text: 'Te solucionan lo que propones y asesoran.',
  },
  {
    id: 3,
    name: 'Anavarro ANavarro',
    text: 'El dueño de la inmobiliaria es amable y buena persona y ayuda y orienta a todos.',
  },
  {
    id: 4,
    name: 'Graham Horton',
    text: 'David is very helpfull and is always willing to go the extra mile to help people. Many thanks.',
  },
]
