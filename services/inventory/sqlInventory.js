const QUERIES = {
  // allObjectCount: `
  //    select count(*) as total from tinventory where id_object_type=?;
  // `,

  // allStatusLinesCount: `
  //   select count(*) as total from tinventory where id_object_type=? and status=?;
  // `,

  // allErrorStatusLines: `
  //    select id, owner, name, description, 
  //    DATE_FORMAT(last_update, '%d-%m-%Y') AS last_update,
  //    status, 
  //     DATE_FORMAT(receipt_date, '%d-%m-%Y') AS receipt_date,
  //     DATE_FORMAT(issue_date, '%d-%m-%Y') AS issue_date 
  //     from tinventory where id_object_type=? and status not in (?,?);
  // `,

  allLinesGroupedByStatus: `
    SELECT 
  COALESCE(NULLIF(TRIM(status), ''), 'undefined') AS status,
  id,
  owner,
  name,
  description,
  DATE_FORMAT(last_update, '%d-%m-%Y') AS f_last_update, 
  DATE_FORMAT(receipt_date, '%d-%m-%Y') AS receipt_date,
  DATE_FORMAT(issue_date, '%d-%m-%Y') AS issue_date
    FROM tinventory
    WHERE id_object_type = 28
      ORDER BY 
          status, last_update DESC;
  `,

  // usuarios que tienen mas de una linea movil
  linesByEmployee: `
SELECT id, owner, name, description, 
  DATE_FORMAT(last_update, '%d-%m-%Y') AS last_update,
  status,
  DATE_FORMAT(receipt_date, '%d-%m-%Y') AS receipt_date,
  DATE_FORMAT(issue_date, '%d-%m-%Y') AS issue_date 
    FROM tinventory 
WHERE id_object_type = 28 
AND owner IS NOT NULL  
AND owner != ''       
AND owner IN (
    SELECT owner 
    FROM tinventory 
    WHERE id_object_type = 28 
    AND owner IS NOT NULL
    AND owner != ''
    GROUP BY owner 
    HAVING COUNT(*) > 1
)
ORDER BY owner;
  `,
};

export default QUERIES;
