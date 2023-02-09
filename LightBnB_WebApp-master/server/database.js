const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');
/// Users
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});
pool.query(`
SELECT title 
FROM properties 
LIMIT 10;
`).then(response => {
  console.log(response);
});
/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
// const getUserWithEmail = function(email) {
//   let user;
//   for (const userId in users) {
//     user = users[userId];
//     if (user.email.toLowerCase() === email.toLowerCase()) {
//       break;
//     } else {
//       user = null;
//     }
//   }
//   return Promise.resolve(user);
// };
const getUserWithEmail = function(email) {
  const query = `
  SELECT *
  FROM users 
  WHERE email = $1
  `;
  const params = [email];

  return pool
    .query(query, params)
    .then((result) => result.rows)
    //rows will always be an array
    .then((rows) => rows[0])
    .then((user) => user ? user : null)
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
// const getUserWithId = function(id) {
//   return Promise.resolve(users[id]);
// };
const getUserWithId = (id) => {
  const query = `
  SELECT *
  FROM users 
  WHERE id = $1
  `;
  const params = [id];

  return pool
    .query(query, params)
    .then((result) => result.rows)
    //rows will always be an array
    .then((rows) => rows[0])
    .then((user) => user ? user : null)
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
// const addUser = function(user) {
//   const userId = Object.keys(users).length + 1;
//   user.id = userId;
//   users[userId] = user;
//   return Promise.resolve(user);
// };
const addUser = (user) => {

  const query = (`
  INSERT INTO users (name, email, password) 
  VALUES ($1, $2, $3)
  RETURNING *;
  `);
  const params = [user.name, user.email, user.password];
  return pool
    .query(query, params)
    .then((result) => result.rows)
    //rows will always be an array
    .then((rows) => rows[0])
    .then((user) => user ? user : null)
    .catch((err) => {
      console.log(err.message);
    });


};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const query = (`
  SELECT reservations.*, properties.*, AVG(property_reviews.rating) AS average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY reservations.id, properties.id
  ORDER BY reservations.start_date asc
  LIMIT $2;
  `);
  const params = [guest_id, limit];
  return pool
    .query(query, params)
    .then((result) => result.rows)
    //represents all reservations for guest
    //rows will always be an array
    // .then((rows) => rows[0])
    // take the first reservation
    // .then((user) => user ? user : null)
    // if there is a reservation return it if not null
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllReservations = getAllReservations;

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
// const getAllProperties = function(options, limit = 10) {
//   const limitedProperties = {};
//   for (let i = 1; i <= limit; i++) {
//     limitedProperties[i] = properties[i];
//   }
//   return Promise.resolve(limitedProperties);
// };
// const getAllProperties = (options, limit = 10) => {

//   return pool
//     .query(`
//       SELECT * 
//       FROM properties
//       LIMIT $1
//       `, [limit])
//     .then((result) => {
//       console.log(result.rows);
//       return result.rows;
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });
// };
const getAllProperties = function(options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  WHERE 1=1\n
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `AND city LIKE $${queryParams.length}\n`;
  }

  if (options.owner_id) {
    queryParams.push(`%${options.owner_id}%`);
    queryString += `AND owner_id = $${queryParams.length}\n`;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    queryString += `AND cost_per_night >= $${queryParams.length}\n`;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    queryString += `AND cost_per_night <= $${queryParams.length}\n`;
  }

  queryString += 'GROUP BY properties.id\n';

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `HAVING avg(rating) >= $${queryParams.length}\n`;
  }


  // 4
  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
// const addProperty = function(property) {
//   const propertyId = Object.keys(properties).length + 1;
//   property.id = propertyId;
//   properties[propertyId] = property;
//   return Promise.resolve(property);
// };
const addProperty = function(property) {
  const query = (`
  INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *;
  `);
  const params = [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms];
  return pool
  .query(query, params)
  .then((result) => result.rows)
  .catch((err) => {
    console.log(err.message);
  });
};
exports.addProperty = addProperty;
