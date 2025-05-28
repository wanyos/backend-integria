const QUERIES = {
  allMobileLines: `
 SELECT 
    i.id,
    i.owner,
    i.name AS nombre_completo,
    SUBSTRING_INDEX(i.name, '-', -1) AS extension,
    i.description,
    DATE_FORMAT(i.last_update, '%d-%m-%Y') as last_update,
    i.status,
    ofd_icc.data AS icc,
    ofd_numero.data AS numero_linea,
    ofd_perfil.data AS perfil,
    ofd_tarifa.data AS tarifa_plan,
    ofd_puk.data AS puk,
    ofd_uso.data AS uso_linea
FROM 
    tinventory i
INNER JOIN 
    tobject_type t ON i.id_object_type = t.id
LEFT JOIN 
    tobject_field_data ofd_icc ON ofd_icc.id_inventory = i.id AND ofd_icc.id_object_type_field = 317
LEFT JOIN 
    tobject_field_data ofd_numero ON ofd_numero.id_inventory = i.id AND ofd_numero.id_object_type_field = 319
LEFT JOIN 
    tobject_field_data ofd_perfil ON ofd_perfil.id_inventory = i.id AND ofd_perfil.id_object_type_field = 320
LEFT JOIN 
    tobject_field_data ofd_tarifa ON ofd_tarifa.id_inventory = i.id AND ofd_tarifa.id_object_type_field = 321
LEFT JOIN 
    tobject_field_data ofd_puk ON ofd_puk.id_inventory = i.id AND ofd_puk.id_object_type_field = 323
LEFT JOIN 
    tobject_field_data ofd_uso ON ofd_uso.id_inventory = i.id AND ofd_uso.id_object_type_field = 368
WHERE 
    i.id_object_type = ?
ORDER BY 
    i.id;
 `,

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
    WHERE id_object_type = ?
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
WHERE id_object_type = ?
AND owner IS NOT NULL  
AND owner != ''       
AND owner IN (
    SELECT owner 
    FROM tinventory 
    WHERE id_object_type = ? 
    AND owner IS NOT NULL
    AND owner != ''
    GROUP BY owner 
    HAVING COUNT(*) > 1
)
ORDER BY owner;
  `,
};

export default QUERIES;
