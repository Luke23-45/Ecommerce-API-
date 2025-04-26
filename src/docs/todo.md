- Create the repository folder, there we would implement all the database related logic for each corresponding services file of service folder. In the services file, we would call the corresponding function from the corresponding repository files rather than writing implemention the query or database interaction logic within services file. 
- Two type of user
  - Bussiness account
  - User account - (vendor, general user)

- Implementing the dependency injectin. 
  - Create the instances of all the classes in the server.ts file or server entry file. And pass the necessary instances or object to the specific routes. 

- Create the interfaces folder which contains corresponding sub-folder like product and so on. within these each files we would create the file for each interfaces. 

- Implement the data(req.body) validator within the route rather than in controller. If there is error then retrun from the validator before passing to controller. 

- Implemention of the group, bussiness account and permission layers. 


- Validate the req.body for the post method. 
- Before passing the control to the controller check required data is given otherwise return from there. 
- Make the consistence reponse object.
- Add the category model. // current focus. 
- In each servies we create the instances of their corresponding repository. 