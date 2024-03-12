# NestJS Full-Stack Boilerplate

This is an opinionated NestJS boilerplate

## External Dependencies

External dependencies:

* [x] Postgres
* [x] Redis
* [x] RabbitMQ

## Development niceties

* [x] Docker & Docker-compose
* [ ] Schematic for generating model CRUD

## Features

* [x] Health check
  * [x] Server Health Check
  * [x] Database Health Check
  * [x] RabbitMQ Health Check
  * [x] Redis Health Check
* [ ] Authentication
  * [ ] Username / Password
    * [ ] Multiple hashing algorithm?
  * [ ] Multi-Factor Authentication
* [ ] Authorization
  * [ ] ABAC (?) / RBAC (?)
* [ ] Payment
  * [ ] Stripe Integration
* [ ] Notification
  * [ ] User notification preferences
  * [ ] Email (SMTP)
    * [ ] Email Template (MJML - ?)
  * [ ] SMS (Twilio)
  * [ ] Push Notification (Firebase)
* [x] Queuing
    * [x] Workers
* [ ] i18n
* [ ] Admin interface
* [ ] Testing
