# Overview

HIH consists of three major building blocks:
* Identity Server
* API (Web API)
* UI app (Typescript app)

## Common

There are several common parts which need be documented.

### Key of Learning History
The learning history has a combined key:
* User
* Learn Object
* Learn Date

To make it survive in Web API part, there should be a combined key used for communication between UI and API:

For UI layer (Typescript codes):

```typescript
public generateKey() : string {
  return this.UserId + "_" + this.ObjectId.toString() + "_" + hih.Utility.Date2String(this.LearnDate); 
}
```

For API layer (C# codes):

```csharp
public string generateKey() 
{
  return this.UserID +"_" + this.ObjectID.ToString() + "_" + String.Format("0:yyyy-MM-dd", this.LearnDate);
}
```

## UI part

The TypeScript UI app consists lots of the interfaces.

### Detail page

See wiki page for UI Development: [Wiki page](https://github.com/alvachien/achihui/wiki/UI-development)


### List page

See wiki page for UI Development: [Wiki page](https://github.com/alvachien/achihui/wiki/UI-development)


## Buffer service

To save the working load the API, also increase the performance of the app from the UI layer, the following part are bufferred automatically:
* User
* Currency
* Document Type
* Account Category
* Transaction
* Learn Category


## Authority control

Authority control applys to all objects.

* Finance Account (Claim: FinanceAccountScope); 
    - OnlyOwnerAndDisplay: Only access the account which Owner is current user, it can only display it;
    - OnlyOwnerFullControl: Only access the account which Owner is current user, but with full control;
    - All: Can access all accounts.
* Finance Document;
    - Display;
    - All
* Finance Balance Sheet Report
    - Display;
* Learn Object;
    - Display: Can display the learn object;
    - All: Can access all objects;
* Learn History (Claim: LearnHistoryScope);
    - OnlyOwnerAndDisplay: Only access the history which belongs to current user, it can only display it;
    - OnlyOwnerFullControl: Only access the history which belongs to current user, but with full control;
    - All: can access all histories;
* Others;

## Others



