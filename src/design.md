# Overview

HIH consists of three major building blocks:
* Identity Server
* API (Web API)
* UI app (Typescript app)

## Common

There are several common parts which need be documented.

### Base Model

There is a base class BaseModel which defined the following methods
* onSetData: parse the data fetched from API and translate into attributes for UI;
* writeJSONString: construct the string which can be sent to API, it depends on writeJSONObject;
* writeJSONObject: also prepared for sending data to API;
* onVerify: verify the data;

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

### Finance Document
There are several important parts in Finance Document part.

#### Base currency
The base currency now stored in Home definition profile. 
It shall keep unchange after the home defintion was created.

#### Foreign currency support
There are several scenarios with Foreign currency are supported:
* Exchange rate in HIH stands for the number of the base currency which 100 foreign currency can exchange for. For instance, if set base currency as CNY, and 1 EUR = 5 CNY, you need input 500.00 as exchange rate during the posting.
* Post a normal document with foreign currency but WITHOUT exchange rate known is allowed. A typical example is, do shopping via Creditcard. In this case, provide an estimated exchange rate and mark 'ProposedExchangeRate';
* Post the currency exchange document, in this case, the exchange rate must be inputted, and 'ProposedExchangeRate' cannot be set. It was designed to map the scenario when you pay the creditcard with foreign currency exist. The system will detect the previous documents with exactly same currency which marked 'ProposedExchangeRate', and you can make a decision whether to reset the 'ProposedExchangeRate' flag.
* Transfer document with foreign currency can also mark 'ProposedExchangeRate' if the exact rate is unknown.

#### Advanced payment support
Advanced payment shall be splitted into pieces to make the expense more reality.
* When posting an advanced payment document, an account will be created automatically with Category 'Advanced payment'; 
* Via the repeat frequency setting, the template documents will be created;
* Once the template documents got posted, the field 'REFDOCID' got updated with real document ID;
* The unposted template documents will appear in the 'Todo' page of Finance;

#### Loan support
The Loan involves the interest calculation.
* Post a loan document will create an account with category Loan automatically.
* Just like advanced payment, repayment method need be maintained, the template documents will be created automatically;
* Others

#### Others
Others

### Library Document
#### Book Category
Biographies & Memoirs
Business & Money
Calendars
Christian Books & Bibles
Comics & Graphic Novels
Computers & Technology
Cookbooks, Food & Wine
Crafts, Hobbies & Home
Education & Teaching
Engineering & Transportation
Gay & Lesbian
Health, Fitness & Dieting
Humor & Entertainment
Literature & Fiction
Medical Books
Mystery, Thriller & Suspense
Parenting & Relationships
Politics & Social Sciences
Reference
Religion & Spirituality
Romance
Science & Math
Science Fiction & Fantasy
Self-Help
Sports & Outdoors
Teen & Young Adult
Test Preparation

#### Movie Genre
Action & Adventure
Animation
Anime
Classics
Comedy
Documentary
Drama
Exercise & Fitness
Faith & Spirituality
Foreign Language & International
Gay & Lesbian
Horror
Indian Cinema & Bollywood
Indie & Art House
Kids & Family
Music Videos & Concerts
Romance
Science Fiction
Western


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
* Finance Account
* Finance Document
* Learn Object
* Learn History
* Control Center
* Order

The buffer can be bypassed if you refresh the list manually via the 'refresh' button.

## Use webpack instead of ng
The following commands shall be used directly:
   - "npm run build" to build.
   - "npm test" to run unit tests.
   - "npm start" to serve the app using webpack-dev-server.
   - "npm run e2e" to run protractor.

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

## Copy TinyMCE library
Powershell:

xcopy /I /E node_modules\tinymce\skins src\assets\tinymceskins

## Others



