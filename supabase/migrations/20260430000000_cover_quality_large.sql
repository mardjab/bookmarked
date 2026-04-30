-- Upgrade existing Open Library cover URLs from medium (-M) to large (-L) size
update books
set cover_url = replace(cover_url, '-M.jpg', '-L.jpg')
where cover_url like '%covers.openlibrary.org%' and cover_url like '%-M.jpg';
