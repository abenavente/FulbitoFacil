require 'test_helper'

class GeneresControllerTest < ActionController::TestCase
  setup do
    @genere = generes(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:generes)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create genere" do
    assert_difference('Genere.count') do
      post :create, genere: @genere.attributes
    end

    assert_redirected_to genere_path(assigns(:genere))
  end

  test "should show genere" do
    get :show, id: @genere
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @genere
    assert_response :success
  end

  test "should update genere" do
    put :update, id: @genere, genere: @genere.attributes
    assert_redirected_to genere_path(assigns(:genere))
  end

  test "should destroy genere" do
    assert_difference('Genere.count', -1) do
      delete :destroy, id: @genere
    end

    assert_redirected_to generes_path
  end
end
