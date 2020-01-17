$(document).ready(function() {
	$('#table1').DataTable( {
		"responsive":true,
		initComplete: function () {
			this.api().columns().every( function () {
				var column = this;
				var select = $('<select><option value=""></option></select>')
					.appendTo( $(column.footer()).empty() )
					.on( 'change', function () {
						var val = $.fn.dataTable.util.escapeRegex(
							$(this).val()
						);

						column
							.search( val ? '^'+val+'$' : '', true, false )
							.draw();
					} );

				column.data().unique().sort().each( function ( d, j ) {
					select.append( '<option value="'+d+'">'+d+'</option>' )
				} );
			} );
		}
	} );

	$('select').select2({
		placeholder: "Select a value",
		theme:"bootstrap"
	});

	//table2
	/* Formatting function for row details - modify as you need */
	function format ( d ) {
		// `d` is the original data object for the row
		return '<table class="table table-striped" cellpadding="5" style="padding-left:50px;">'+
			'<tr>'+
			'<td>User name:</td>'+
			'<td>'+d.UserName+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>contact no:</td>'+
			'<td>'+d.contact+'</td>'+
			'</tr>'+
			'<tr>'+
			'<td>Extra info:</td>'+
			'<td>And any further details here (images etc)...</td>'+
			'</tr>'+
			'</table>';
	}

	$(document).ready(function() {
		var table2 = $('#table2').DataTable( {
			"ajax": "js/pages/data.txt",
			"columns": [
				{
					"className":	  'details-control',
					"orderable":	  false,
					"data":		   null,
					"defaultContent": ''
				},
				{ "data": "#" },
				{ "data": "FirstName" },
				{ "data": "LastName" },
				{ "data": "UserE-mail" }
			],
			"order": [[1, 'asc']],
			"responsive":true
		} );

		// Add event listener for opening and closing details
		$('#table2 tbody').on('click', 'td', function () {
			var tr = $(this).closest('tr');
			var row = table2.row( tr );

			if ( row.child.isShown() ) {
				// This row is already open - close it
				row.child.hide();
				tr.removeClass('shown');
			}
			else {
				// Open this row
				row.child( format(row.data()) ).show();
				tr.addClass('shown');
			}
		} );
	} );



	//table3
	jQuery(document).ready(function() {

		var table3 = $('#table3').DataTable({
			"responsive":true
		});

		$('button.toggle-vis').on('click', function(e) {
			e.preventDefault();

			// Get the column API object
			var column = table3.column($(this).attr('data-column'));

			// Toggle the visibility
			column.visible(!column.visible());
		});

	});
} );


//table4

var table4 = $('#table4').DataTable({
	"responsive":true
});
$("#table5").DataTable({
	"responsive":true
});
