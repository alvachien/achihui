# Overview

HIH consists of three building blocks:
* Identity Server
* API
* UI app (Javascript/Typescript app)

## Common

There are several common parts which need be documented.

### Key of Learning History
The learning history has a combined key:
* User ID
* Learn Object ID
* Learn Date

To make it survive in WebAPI part, there should be a combined key used for communication between UI and API:

For UI layer (Typescript codes):

`   public generateKey() : string {
        return this.UserId + "_" + this.ObjectId.toString() + "_" + hih.Utility.Date2String(this.LearnDate); 
    }
`

For API layer (C# codes):

`
public string generateKey() 
{
    return this.UserID +"_" + this.ObjectID.ToString() + "_" + String.Format("0:yyyy-MM-dd", this.LearnDate);
}
`

## UI part

The TypeScript UI app consists lots of the interfaces:

### Detail page

(See wiki page)

### List page

(See wiki page)

## Authority control

Authority control applys to all objects.

* Finance Account; 
    - OnlyOwnerAndDisplay: Only access the account which Owner is current user, it can only display it;
    - OnlyOwnerFullControl: Only access the account which Owner is current user, but with full control;
    - All: Can access all accounts.
* Finance Document;
    - OnlyOwner
* Learn Object;
    - Display: Can display the learn object;
    - All: Can access all objects;
* Learn History;
    - OnlyOwnerAndDisplay: Only access the history which belongs to current user, it can only display it;
    - OnlyOwnerFullControl: Only access the history which belongs to current user, but with full control;
    - All: can access all histories;
* Others;

## Others



