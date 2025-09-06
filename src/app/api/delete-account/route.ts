import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../supabaseClient'

/**
 * API Route: Delete user account
 * 
 * This endpoint:
 * 1. Verifies the user is authenticated
 * 2. Deletes all user's songs from storage and database
 * 3. Deletes the user from Supabase Auth
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get the current user from the session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the user is trying to delete their own account
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this account' },
        { status: 403 }
      )
    }

    // 1. Get all user's songs to get file paths
    const { data: userSongs, error: songsError } = await supabase
      .from('songs')
      .select('file_path')
      .eq('user_id', userId)
    
    if (songsError) {
      console.error('Error fetching user songs:', songsError)
      return NextResponse.json(
        { error: 'Failed to fetch user songs' },
        { status: 500 }
      )
    }
    
    // 2. Delete all user's files from storage
    if (userSongs && userSongs.length > 0) {
      const filePaths = userSongs.map(song => song.file_path)
      const { error: storageError } = await supabase.storage
        .from('mp3')
        .remove(filePaths)
      
      if (storageError) {
        console.error('Error deleting files from storage:', storageError)
        return NextResponse.json(
          { error: 'Failed to delete files from storage' },
          { status: 500 }
        )
      }
    }
    
    // 3. Delete all user's songs from database
    const { error: songsDeleteError } = await supabase
      .from('songs')
      .delete()
      .eq('user_id', userId)
    
    if (songsDeleteError) {
      console.error('Error deleting songs from database:', songsDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete songs from database' },
        { status: 500 }
      )
    }

    // 4. Sign out the user (this will clear their session)
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.error('Error signing out user:', signOutError)
      // Don't fail the request if sign out fails, data is already deleted
    }

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data deleted successfully'
    })

  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
