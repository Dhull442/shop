$(function(){
  if($('ta').length){
    CKEDITOR.replace('ta');
  };

  $('a.confirmDelete').on('click',function(e){
    if(!confirm('Confirm Deletion'))
    return false;
  });

});
