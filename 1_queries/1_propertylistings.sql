-- SELECT properties.id AS id,properties.title AS title, properties.cost_per_night AS cost_per_night, AVG(property_reviews.rating) AS average_rating
-- FROM properties
-- JOIN property_reviews ON property_id = properties.id
-- WHERE properties.province = 'Vancouver'
-- GROUP BY rating
-- HAVING rating >= 4
-- ORDER BY cost_per_night asc 
-- LIMIT 10;
SELECT properties.id, title, cost_per_night, avg(property_reviews.rating) as average_rating
FROM properties
LEFT JOIN property_reviews ON properties.id = property_id
WHERE city LIKE '%ancouv%'
GROUP BY properties.id
HAVING avg(property_reviews.rating) >= 4
ORDER BY cost_per_night
LIMIT 10;
