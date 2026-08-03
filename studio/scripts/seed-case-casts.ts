import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2026-08-01' })

const casts = [
  [['Creative Direction', 'Maya Chen'], ['Art Direction', 'Leon Hart'], ['Photography', 'Nora Vale'], ['Production', 'Common Practice']],
  [['Creative Direction', 'Iris Okafor'], ['Design', 'Theo Marin'], ['Motion', 'Sasha Bell'], ['Sound', 'Jonas Reed']],
  [['Art Direction', 'Amara Singh'], ['Photography', 'Felix North'], ['Styling', 'Mina Park'], ['Production', 'Field Office']],
  [['Creative Direction', 'Elena Rossi'], ['Design', 'Noah Klein'], ['Development', 'Milo Tan'], ['Type Design', 'Ada Flores']],
  [['Art Direction', 'Rina Cole'], ['3D Artist', 'Pavel Miron'], ['Motion', 'June Ellis'], ['Sound', 'Soft Signal']],
  [['Creative Direction', 'Samira Moss'], ['Photography', 'Emil Ward'], ['Set Design', 'Luca Stone'], ['Production', 'Assembly Unit']],
  [['Art Direction', 'Nadia Kim'], ['Design', 'Owen Price'], ['Illustration', 'Cleo James'], ['Animation', 'Tariq Lane']],
  [['Creative Direction', 'Eva Laurent'], ['Photography', 'Kai Mercer'], ['Styling', 'Anya Wells'], ['Casting', 'Open Studio']],
  [['Art Direction', 'Mara Voss'], ['Design', 'Eli Navarro'], ['Creative Coding', 'Ren Ito'], ['Sound', 'Bright Audio']],
  [['Creative Direction', 'Sofia Vale'], ['Photography', 'Nico Arden'], ['Color', 'Imani Brooks'], ['Production', 'Local Unit']],
  [['Art Direction', 'Alex Rowe'], ['Design', 'Yuna Choi'], ['Research', 'Mira West'], ['Editorial', 'Public Office']],
  [['Creative Direction', 'Nina Foster'], ['Design', 'Arlo Bennett'], ['Development', 'Zoe Lin'], ['Motion', 'Archive Lab']]
]

let transaction = client.transaction()

for (const [index, cast] of casts.entries()) {
  const id = `test-case-${String(index + 1).padStart(2, '0')}`
  transaction = transaction.patch(id, patch => patch.set({
    cast: cast.map(([role, name], creditIndex) => ({
      _key: `credit-${index + 1}-${creditIndex + 1}`,
      _type: 'object',
      role,
      name
    }))
  }))
}

await transaction.commit()
console.log(`Added fictional casts to ${casts.length} test cases.`)
