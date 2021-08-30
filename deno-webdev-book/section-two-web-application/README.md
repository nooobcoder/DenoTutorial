# Run App
`deno run --no-check --watch --allow-net --unstable --allow-env --allow-read --allow-run index.ts`

## Goals of the App

I am building an application that will let people create and interact with a list of museums. We can make this cleared by listing its features as user stories as follows:

- The user is able to register and log in.
- The user is able to create a museym with a title, description and location
- The user can view a list of museums.


## Generate Self Signed Certificates

You can do this via openssl:

1.  Install openssl package (if you are using Windows, download binaries  [here](https://www.openssl.org/related/binaries.html)).
    
2.  Generate private key:  `openssl genrsa 2048 > key.pem`
    
3.  Generate the self signed certificate:  `openssl req -x509 -days 1000 -new -key key.pem -out cert.pem`
    
4.  If needed, create PFX:  `openssl pkcs12 -export -in cert.pem -inkey key.pem -out mycert.pfx`

## Technical requirements

The code files used in this chapter are available at the following link: 
`https://github.com/PacktPublishing/Deno-Web-Development/tree/master/Chapter04/museums-api.`