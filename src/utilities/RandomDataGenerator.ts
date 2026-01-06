import { faker } from '@faker-js/faker'

export type DataType =
    | 'name'
    | 'email'
    | 'phone'
    | 'address'
    | 'uuid'
    | 'number'
    | 'date'
    | 'creditCard'

export interface GeneratorOptions {
    count?: number
    min?: number
    max?: number
}

export function generateRandomData(type: DataType, options: GeneratorOptions = {}): any[] {
    const count = options.count || 1
    const results: any[] = []

    for (let i = 0; i < count; i++) {
        switch (type) {
            case 'name':
                results.push(faker.person.fullName())
                break
            case 'email':
                results.push(faker.internet.email())
                break
            case 'phone':
                results.push(faker.phone.number())
                break
            case 'address':
                results.push(`${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`)
                break
            case 'uuid':
                results.push(faker.string.uuid())
                break
            case 'number':
                results.push(faker.number.int({ min: options.min || 0, max: options.max || 1000 }))
                break
            case 'date':
                results.push(faker.date.anytime().toISOString())
                break
            case 'creditCard':
                results.push(faker.finance.creditCardNumber())
                break
        }
    }

    return results
}
