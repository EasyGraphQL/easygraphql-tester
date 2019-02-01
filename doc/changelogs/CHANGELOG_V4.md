# easygraphql-tester V4 ChangeLog

<table>
<tr>
<th>Current</th>
</tr>
<tr>
<td>
<a href="#4.1.4">4.1.4</a><br/>
<a href="#4.1.3">4.1.3</a><br/>
<a href="#4.1.2">4.1.2</a><br/>
<a href="#4.1.1">4.1.1</a><br/>
<a href="#4.1.0">4.1.0</a><br/>
<a href="#4.0.0">4.0.0</a><br/>
</td>
</tr>
</table>

<a id="4.1.4"></a>
## Version 4.1.4

### Notable Changes

* **Validate deprecated fields**: Pass the option to validate deprecated fields, if there is one it'll throw an error.
* **Use JSON schema**: Bump dependencies to use JSON schema.
* **easygraphql-mock**:
  - Bump version of easygraphql-mock.
* **easygraphql-parser**:
  - Bump version of easygraphql-parser.

### Commits

* [[`7df57d65b5`](https://github.com/EasyGraphQL/easygraphql-tester/commit/7df57d65b5)] - Validate deprecated fields and receive JSON schema.

<a id="4.1.3"></a>
## Version 4.1.3

### Notable Changes

* **Fix fixture on nested array**: Prevent returning the last value of the array and set the correct values.

### Commits

* [[`73345b4ff9`](https://github.com/EasyGraphQL/easygraphql-tester/commit/73345b4ff9)] - Fix array nested fixture.

<a id="4.1.2"></a>
## Version 4.1.2

### Notable Changes

* **Set fixture to enum**: Set passed fixture to enum.

### Commits

* [[`cd5723b51c`](https://github.com/EasyGraphQL/easygraphql-tester/commit/cd5723b51c)] - Set fixture to enum.

<a id="4.1.1"></a>
## Version 4.1.1

### Notable Changes

* **Set fixture to custom scalar**: Set passed fixture to custom scalar.
* **Validate schema against fixture typeof**: Validate field type against the typeof fixture.

### Commits

* [[`3f634be654`](https://github.com/EasyGraphQL/easygraphql-tester/commit/3f634be654)] - Fix custom scalar.

<a id="4.1.0"></a>
## Version 4.1.0

### Notable Changes

* **Update fixture validation**: Validate fixture against the parsed schema and no against the mock.
* **Set fixture using class method**: Set fixtures with `.setFixture()`.
* **Prevent auto mock query fields with fixture**: Prevent autoMock of the fields that are not on the fixture.
* **Validate fixture values with autoMock disables**: validate that the fields on the fixture match with the request ones on the query (ignore extra fields that are not used on the query).
* **Clear fixture value set with setFixture**: Clear the fixture passed with `.setFixture()` and return `autoMock` to `true`.

### Commits

* [[`e6e4c4072c`](https://github.com/EasyGraphQL/easygraphql-tester/commit/e6e4c4072c)] - Set fixture method.

<a id="4.0.0"></a>
## Version 4.0.0

### Notable Changes

* **Return fixture of errors**: Return a fixture of a custom error.
* **Return partial data and errors**: Return a mock of partial data and errors.
* **Return mock object inside data**: Return the mock inside a data object, the same format used on GraphQL.
* **Validate used variables defined on the query**: Validate the used variables that are defined on the query.
* **Return array of scalar fixture**: Return the array of scalar values.
* **Validate custom scalar on mutation input**: Validate custom scalar on mutation input.


### Commits

* [[`1ad826c9d8`](https://github.com/EasyGraphQL/easygraphql-tester/commit/1ad826c9d8)] - Partial GraphQLResponse.
* [[`c296406960`](https://github.com/EasyGraphQL/easygraphql-tester/commit/c296406960)] - Validate variables on multiple queries.
* [[`b9f596ab65`](https://github.com/EasyGraphQL/easygraphql-tester/commit/b9f596ab65)] - Return scalar arr.
* [[`e3f05dea86`](https://github.com/EasyGraphQL/easygraphql-tester/commit/e3f05dea86)] - Remove unused set null fixture.
* [[`a65e2b5638`](https://github.com/EasyGraphQL/easygraphql-tester/commit/a65e2b5638)] - Validate scalar on input.
