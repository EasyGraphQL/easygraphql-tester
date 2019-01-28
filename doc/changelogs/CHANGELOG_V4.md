# easygraphql-tester V4 ChangeLog

<table>
<tr>
<th>Current</th>
</tr>
<tr>
<td>
<a href="#4.1.0">4.1.0</a><br/>
<a href="#4.0.0">4.0.0</a><br/>
</td>
</tr>
</table>

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
