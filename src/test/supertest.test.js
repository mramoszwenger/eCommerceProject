import * as chai from 'chai';
import supertest from 'supertest';
import { generateToken } from '../config/index.js';

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe ('Test eCommerce', ()=> {

    let token;

    before(async () => {
        const userCredentials = {
            email: 'martha@example.com',
            password: 'mS123456'
        };
    
        const response = await requester.post('/api/login').send(userCredentials);
        token = response.body.token;
        if (!token) {
            throw new Error('No se pudo obtener el token');
        }
    });

    describe('Test de producto', () => {
        it ('El endpoint POST /api/products debe crear un producto correctamente', async () => {
            const productMock = {
                title: 'Pendrive',
                description: 'Kingstone',
                price: '25000',
                stock: '10',
                code: ''
            }

            const {
                statusCode,
                ok,
                _body
            } = await requester.post('/api/products').send(productMock)

            console.log(statusCode)
            console.log(ok)
            console.log(_body)        
        })
    })

    describe('Test de usuario', () => {
        it ('El endpoint POST /api/users debe crear un usuario correctamente', async () => {
            const userMock = {
                first_name: 'Jose',
                last_name: 'Sanchez',
                age: '30',
                email: 'jose@example.com',
                password: '123456'
            }

            const {
                statusCode,
                ok,
                _body
            } = await requester.post('/api/products').send(userMock)

            console.log(statusCode)
            console.log(ok)
            console.log(_body)     
        })
    })
})